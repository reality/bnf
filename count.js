var _ = require('underscore')._,
    fs = require('fs'),
    se = JSON.parse(fs.readFileSync('bnf_side_effects.json'));

var drug_count = 0;
var distinct_side_effects = [];
var total_side = 0;

_.each(se, function(key, item) {
  drug_count++;
  _.each(key, function(b) {
    _.each(b, function(a) {
      if(!_.include(distinct_side_effects, a)) {
        distinct_side_effects.push(a);
      }
      total_side++
    });
  });
});

console.log('drugs: ' + drug_count);
console.log('side effects: ' + distinct_side_effects.length);
console.log('side effects total: ' + total_side);


