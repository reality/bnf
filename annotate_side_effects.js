var _ = require('underscore')._,
    cheerio = require('cheerio'),
    fs = require('fs'),
    request = require('request'),
    async = require('async'),
    se = JSON.parse(fs.readFileSync('bnf_side_effects.json')),
    drugs = {};

async.eachSeries(_.keys(se), function(drug, done) {
  request('http://aber-owl.net/service/api/queryNames.groovy?ontology=PhenomeNET&term='+drug, function(err, res, body) {
    console.log(drug);
    _.each(body, function(res, z) {
    console.log(res);
      console.log('  ' + res[0]['first_label']); 
      if(z > 3) {
        return;
      }
    });
    return done();
  });
}, function() {
  //fs.writeFileSync('bnf_links.json', JSON.stringify(links, null, '  '));
});

//fs.writeFileSync('bnf_side_effects.json', JSON.stringify(pse, null, '  '));
