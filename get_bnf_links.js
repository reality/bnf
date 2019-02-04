var cheerio = require('cheerio'),
    request = require('request'),
    _ = require('underscore')._,
    fs = require('fs'),
    async = require('async');

var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    links = {};

async.eachSeries(alphabet, function(l, c) {
  request('https://www.evidence.nhs.uk/formulary/bnf/current/alphalist/' + l, function(err, res, body) {
    $ = cheerio.load(body, { 'normalizeWhitespace': true, 'xmlMode': true });
    $('.media').each(function(index) {
      $this = $(this);
      var element = $this.find('a'),
          name = element.text().toLowerCase(),
          link = element.attr("href");

      if(!link.match(/interaction/)) {
        if(!_.has(links, name)) {
          links[name] = [];
        }
        links[name].push(link);
      }
      c();
    });
  });
}, function() {
  fs.writeFileSync('bnf_links.json', JSON.stringify(links, null, '  '));
});
