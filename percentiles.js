#!/usr/bin/env node
var utils = require('./api/routes/utils.js');

adjustExpertPercentiles = function(experts, categoryName) {
  var percentileDict = {}; // Maps reps value to percentile
  var prev = experts[0].categories[0].reps;
  var newPercentile = experts[0].categories[0].percentile;
  var same = 1;
  var curr;

  // Create the percentile dictionary with the modified percentiles
  for (var i = 1; i < experts.length; i++) {
    curr = experts[i].categories[0].reps;
    if (curr === prev) {
      newPercentile += experts[i].categories[0].percentile;
      same +=1;
    } else {
      percentileDict[prev] = Math.floor(newPercentile/same);
      newPercentile = experts[i].categories[0].percentile;
      same = 1;
    }
    prev = curr;
  }
  percentileDict[curr] = Math.floor(newPercentile/same);

  // Go through the dictionary and reset percentiles
  for (var i = 0; i < experts.length; i++) {
    experts[i].categories[0].percentile = percentileDict[experts[i].categories[0].reps];
  }
};

var experts = [
  { _id: '1', categories: [ { name: 'Coding', reps: 2, percentile: 10 } ] },
  { _id: '2', categories: [ { name: 'Coding', reps: 4, percentile: 30 } ] },
  { _id: '3', categories: [ { name: 'Coding', reps: 6, percentile: 50 } ] },
  { _id: '4', categories: [ { name: 'Coding', reps: 8, percentile: 70 } ] },
  { _id: '5', categories: [ { name: 'Coding', reps: 10, percentile: 90 } ] },
];

var categoryName = 'Coding';

console.log('showing percentile changes with new formula...');
console.log('Original percentiles...');
experts = [
  { _id: '1', categories: [ { name: 'Coding', reps: 2, percentile: 10 } ] },
  { _id: '2', categories: [ { name: 'Coding', reps: 4, percentile: 30 } ] },
  { _id: '3', categories: [ { name: 'Coding', reps: 6, percentile: 50 } ] },
  { _id: '4', categories: [ { name: 'Coding', reps: 8, percentile: 70 } ] },
  { _id: '5', categories: [ { name: 'Coding', reps: 10, percentile: 90 } ] },
];

adjustExpertPercentiles(experts, categoryName);
for (var i = 0; i < experts.length; i++) {
  console.log('_id: ' + experts[i]._id + ', reps: ' + experts[i].categories[0].reps + ', percentile: ' + experts[i].categories[0].percentile)
}
console.log();
console.log('Reformatting reps...');
experts = [
  { _id: '1', categories: [ { name: 'Coding', reps: 2, percentile: 10 } ] },
  { _id: '2', categories: [ { name: 'Coding', reps: 2, percentile: 30 } ] },
  { _id: '3', categories: [ { name: 'Coding', reps: 6, percentile: 50 } ] },
  { _id: '4', categories: [ { name: 'Coding', reps: 8, percentile: 70 } ] },
  { _id: '5', categories: [ { name: 'Coding', reps: 10, percentile: 90 } ] },
];

adjustExpertPercentiles(experts, categoryName);
for (var i = 0; i < experts.length; i++) {
  console.log('_id: ' + experts[i]._id + ', reps: ' + experts[i].categories[0].reps + ', percentile: ' + experts[i].categories[0].percentile)
}

console.log();
console.log('Reformatting reps...');
experts = [
  { _id: '1', categories: [ { name: 'Coding', reps: 2, percentile: 20 } ] },
  { _id: '3', categories: [ { name: 'Coding', reps: 6, percentile: 50 } ] },
  { _id: '4', categories: [ { name: 'Coding', reps: 8, percentile: 70 } ] },
  { _id: '2', categories: [ { name: 'Coding', reps: 10, percentile: 20 } ] },
  { _id: '5', categories: [ { name: 'Coding', reps: 10, percentile: 90 } ] },
];
adjustExpertPercentiles(experts, categoryName);
for (var i = 0; i < experts.length; i++) {
  console.log('_id: ' + experts[i]._id + ', reps: ' + experts[i].categories[0].reps + ', percentile: ' + experts[i].categories[0].percentile)
}

console.log('\n\nupdating percentiles with old formula...');
experts = [
  { _id: '1', categories: [ { name: 'Coding', reps: 2, percentile: 0 } ] },
  { _id: '2', categories: [ { name: 'Coding', reps: 4, percentile: 0 } ] },
  { _id: '3', categories: [ { name: 'Coding', reps: 6, percentile: 0 } ] },
  { _id: '4', categories: [ { name: 'Coding', reps: 8, percentile: 0 } ] },
  { _id: '5', categories: [ { name: 'Coding', reps: 10, percentile: 0 } ] },
];

utils.getExpertPercentiles(experts, categoryName, function() {
  for (var i = 0; i < experts.length; i++) {
    console.log('_id: ' + experts[i]._id + ', reps: ' + experts[i].categories[0].reps + ', percentile: ' + experts[i].categories[0].percentile)
  }
  console.log();
  console.log('Reformatting reps...');
  experts = [
    { _id: '1', categories: [ { name: 'Coding', reps: 2, percentile: 0 } ] },
    { _id: '2', categories: [ { name: 'Coding', reps: 2, percentile: 0 } ] },
    { _id: '3', categories: [ { name: 'Coding', reps: 6, percentile: 0 } ] },
    { _id: '4', categories: [ { name: 'Coding', reps: 8, percentile: 0 } ] },
    { _id: '5', categories: [ { name: 'Coding', reps: 10, percentile: 0 } ] },
  ];

  utils.getExpertPercentiles(experts, categoryName, function() {
    for (var i = 0; i < experts.length; i++) {
      console.log('_id: ' + experts[i]._id + ', reps: ' + experts[i].categories[0].reps + ', percentile: ' + experts[i].categories[0].percentile)
    }
    console.log();
    console.log('Reformatting reps');
    experts = [
      { _id: '1', categories: [ { name: 'Coding', reps: 2, percentile: 20 } ] },
      { _id: '3', categories: [ { name: 'Coding', reps: 6, percentile: 50 } ] },
      { _id: '4', categories: [ { name: 'Coding', reps: 8, percentile: 70 } ] },
      { _id: '2', categories: [ { name: 'Coding', reps: 10, percentile: 20 } ] },
      { _id: '5', categories: [ { name: 'Coding', reps: 10, percentile: 90 } ] },
    ];

    utils.getExpertPercentiles(experts, categoryName, function() {
      for (var i = 0; i < experts.length; i++) {
        console.log('_id: ' + experts[i]._id + ', reps: ' + experts[i].categories[0].reps + ', percentile: ' + experts[i].categories[0].percentile)
      }
    });
  });

});
