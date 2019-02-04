var cheerio = require('cheerio'),
    request = require('request'),
    _ = require('underscore')._,
    fs = require('fs'),
    async = require('async')
    links = JSON.parse(fs.readFileSync('bnf_links.json')),
    se = {}; // side effects

async.eachSeries(_.keys(links), function(drug, drugDone) {
  se[drug] = [];
  async.eachSeries(links[drug], function(link, pageDone) {
    request('https://www.evidence.nhs.uk' + link, function(err, res, body) {
      try {
        $ = cheerio.load(body, { 'normalizeWhitespace': true, 'xmlMode': true });
        $('h2').each(function () {
          $this = $(this);
          if($this.text().match('Side-effects')) {
            var sideEffects = $this.nextAll('p').first().html();
            se[drug].push(sideEffects);
            console.log(drug + ': ' + sideEffects);
          }
        });
      } catch(e) {
        se[drug] = 'Unparseable';
      }
      pageDone();
    });
  }, function() {
    // just in case we get rekt
    fs.writeFileSync('bnf_raw_side_effects.json', JSON.stringify(se, null, '  '));
    drugDone(); 
  });
}, function() {
  fs.writeFileSync('bnf_raw_side_effects.json', JSON.stringify(se, null, '  '));
});
