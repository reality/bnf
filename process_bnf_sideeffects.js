var _ = require('underscore')._,
    cheerio = require('cheerio'),
    fs = require('fs'),
    se = JSON.parse(fs.readFileSync('enriched_bnf_side_effects.json')),
    pse = {}; // side effects

_.each(se, function(sis, drug) {
  if(sis == 'Unparseable') {
    return
  }
  if(sis.length > 0) {
    pse[drug] = {};
  }

  console.log(drug);

  _.each(sis, function(si) {
    _.each(si.split(';'), function(bit) {
      $ = cheerio.load(bit, { 'normalizeWhitespace': true });

      var heading = $('em');
      if(heading.text().length > 0) {
        heading = heading.text();
      } else {
        heading = 'common';
      }

      bit = bit.replace(/<em>(.*)?<\/em>/, '');
      bit = bit.replace(/<a\s(.*)?<\/a>/g, '');
      bit = bit.replace(/.*?include/, '');
      bit = bit.replace(/and/g, ',');
      bit = bit.replace(/,(?=((?!\().)*?\))/g, ';');
      bit = bit.replace(/see\s*$/g, '');
      bit = bit.replace(/see under\s*$/g, '');

      var bits = _.collect(bit.split(','), function(s) { 
        return s.toLowerCase().replace(/\s+/g, ' ').replace(/^\s/,'').trim();
      });

      bits = _.without(bits, '');
      bits = _.without(bits, 'see');

      if(!_.has(pse[drug], heading)) {
        pse[drug][heading] = bits;
      } else {
        pse[drug][heading] = _.union(pse[drug][heading], bits);
      }
    });
  });
});

_.each(pse, function(ses, drug) {
  _.each(ses, function(sis, frequency) {
    _.each(sis, function(si) {
      var lookup = si.match(/^see under (.+)?/);
      if(lookup) {
        lookup[1] = lookup[1].replace(/\(/g,'').replace(/\)/g,'').trim();
        if(_.has(pse, lookup[1])) {
          _.each(pse[lookup[1]], function(items, oFreq) {
            if(!_.has(pse[drug], oFreq)) {
              pse[drug][oFreq] = [];
            }
            pse[drug][oFreq] = _.union(pse[drug][oFreq], items);
          });
        }
      }
    });
  });
});

fs.writeFileSync('bnf_side_effects.json', JSON.stringify(pse, null, '  '));
