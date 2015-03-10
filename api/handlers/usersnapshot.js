'use strict';

var Q = require('q');
var winston = require('winston');
var UserSnapshot = require('../models/UserSnapshot.js');
var Transaction = require('../models/Transaction.js');
var Schema = require('mongoose').Schema;

// Get snapshot reps
// Set expert to true for experts, false for investors
var getReps = function(req, res) {
  var userId = req.params.user_id;
  var category = req.params.category;

  UserSnapshot.getExpertReps(userId, category).then(function(reps) {
    if (reps.length === 0) {
      return res.status(200).send([]);
    }
    var dt, humanDate;
    var results = [];
    results.push(['Date', 'Reps']);
    for (var i = 0; i < reps.length; i++) {
      dt = new Date(reps[i].timeStamp);
      humanDate = (dt.getMonth() + 1) + '/' + dt.getDate();
      results.push([ humanDate, reps[i].reps]);
    }
    return res.status(200).send(results);
  }, function(err) {
    winston.log('error', 'Error finding user snapshots: %s', err.toString());
    return res.status(503).send(err);
  });
};

// Get snapshots ranks
// Set expert to true for experts, false for investors
var getRanks = function(req, res, expert) {
  var userId = req.params.user_id;
  var category = req.params.category;
  var query;
  if (expert) {
    query = UserSnapshot.getExpertRanks(userId, category);
  } else {
    query = UserSnapshot.getInvestorRanks(userId, category);
  }

  query.then(function(ranks) {
    if (ranks.length === 0) {
      return res.status(200).send([]);
    }

    var dt, humanDate;
    var results = [];
    results.push(['Date', 'Rank']);
    for (var i = 0; i < ranks.length; i++) {
      dt = new Date(ranks[i].timeStamp);
      humanDate = (dt.getMonth() + 1) + '/' + dt.getDate();
      results.push([ humanDate, ranks[i].rank]);
    }
    return res.status(200).send(results);
  }, function(err) {
    winston.log('error', 'Error finding user snapshots: %s', err.toString());
    return res.status(503).send(err);
  });
};

var UserSnapshotHandler = {
  userId: {
    category: {
      investor: {
        percentreturns: {
          get: function(req, res) {
            var userId = req.params.user_id;
            var category = req.params.category;
            UserSnapshot.getPercentReturns(userId, category).then(function(returns) {
              if (returns.length === 0) {
                return res.status(200).send([]);
              }

              var dt, humanDate, ret;
              var results = [];
              results.push(['Date', 'Percent Returns']);
              for (var i = 0; i < returns.length; i++) {
                dt = new Date(returns[i]._id);
                humanDate = (dt.getMonth() + 1) + '/' + dt.getDate();
                ret = Math.floor(returns[i].ret * 100);
                results.push([ humanDate, ret]);
              }
              return res.status(200).send(results);
            }, function(err) {
              winston.log('error', 'Error finding percent returns: %s', err.toString());
              return res.status(503).send(err);
            });
          },
        },

        dividends: {
          get: function(req, res) {
            var userId = req.params.user_id;
            var category = req.params.category;
            UserSnapshot.getTotalDividends(userId, category).then(function(dividends) {
              if (dividends.length === 0) {
                return res.status(200).send([]);
              }

              var results = [];
              results.push(['Date', 'Total Dividends']);
              for (var i = 0; i < dividends.length; i++) {
                var dt = new Date(dividends[i]._id);
                var humanDate = (dt.getMonth() + 1) + '/' + dt.getDate();
                results.push([ humanDate, dividends[i].total]);
              }
              return res.status(200).send(results);
            }, function(err) {
              winston.log('error', 'Error finding total dividends: %s', err.toString());
              return res.status(503).send(err);
            });
          },
        },

        ranks: {
          get: function(req, res) {
            return getRanks(req, res, false);
          },
        },
      },

      expert: {
        volume: {
          get: function(req, res) {
            var userId = req.params.user_id;
            var category = req.params.category;
            var time, start, end, dt, humanDate, index, volume;
            var results = [['Date', 'Volume']];
            var humanDates = [];
            var index = 0;
            // Get all of the timestamps for this user
            return UserSnapshot.find({ 'id': userId }, { 'timeStamp': 1 })
              .sort({ 'timeStamp': 1 }).exec().then(function(snapshots) {

              return Q.all(snapshots.map(function(snapshot) {
                // Get the human date, and the range for this day
                time = new Date(snapshot.timeStamp);
                dt = new Date(time);
                humanDate = (dt.getMonth() + 1) + '/' + dt.getDate();
                start = new Date(time.getFullYear(), time.getMonth(), time.getDate()-1);
                end = new Date(time.getFullYear(), time.getMonth(), time.getDate());
                humanDates.push(humanDate);

                return Transaction.findVolume(userId, category, start, end).then(function(result) {
                  // Get the corresponding human date and add to results
                  if (result.length === 0) {
                    volume = 0;
                  } else {
                    volume = result[0].volume;
                  }
                  results.push([humanDates[index], volume]);
                  index++;
                });
              }));
            }).then(function() {
              if (results.length <= 1) {
                return res.status(200).send([]);
              }

              return res.status(200).send(results);
            }, function(err) {
              winston.log('error', 'Error finding user snapshots: %s', err.toString());
              return res.status(503).send(err);
            });
          },
        },

        ranks: {
          get: function(req, res) {
            return getRanks(req, res, true);
          }
        },

        reps: {
          get: function(req, res) {
            return getReps(req, res);
          },
        },
      },
    },
  },
};

module.exports = UserSnapshotHandler;
