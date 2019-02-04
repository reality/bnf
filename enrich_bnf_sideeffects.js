var cheerio = require('cheerio'),
    request = require('request'),
    async = require('async'),
    _ = require('underscore')._,
    fs = require('fs'),
    se = JSON.parse(fs.readFileSync('enriched_bnf_side_effects.json'));

async.eachSeries(_.keys(se), function(drug, drugDone) {
  async.eachSeries(se[drug], function(si, siDone) {
    var links = [];

    try {
      $ = cheerio.load(si, { 'normalizeWhitespace': true });
      $('a').each(function() {
        if(!$(this).text().match(/caution/i)) {
          links.push($(this).attr('href'));
        }
      });

      var newSideEffects = [];
      async.eachSeries(links, function(link, linkDone) {
        request('https://www.evidence.nhs.uk' + link, function(err, res, body) {
          try {
            $ = cheerio.load(body, { 'normalizeWhitespace': true, 'xmlMode': true });

            $('h2').each(function() {
              $this = $(this);
              if($this.text().match('Side-effects')) {
                var sideEffects = $this.nextAll('p').first().html();
                newSideEffects.push(sideEffects);
                console.log(drug + ': ' + sideEffects);
              }
            });
          } catch(e) {}

          linkDone();
        });
      }, function() {
        se[drug] = se[drug].concat(newSideEffects);
        siDone();
      });
    } catch(e) { siDone(); }
  }, function() {
    fs.writeFileSync('enriched_bnf_side_effects.json', JSON.stringify(se, null, '  '));
    drugDone(); 
  });
}, function() {
  fs.writeFileSync('enriched_bnf_side_effects.json', JSON.stringify(se, null, '  '));
});
