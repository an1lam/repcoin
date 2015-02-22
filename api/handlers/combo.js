'use strict';
var winston = require('winston');

var AddExpertEvent = require('../models/AddExpertEvent.js');
var JoinEvent = require('../models/JoinEvent.js');
var NewCategoryEvent = require('../models/NewCategoryEvent.js');
var NewGhostEvent = require('../models/NewGhostEvent.js');
var Transaction = require('../models/Transaction.js');

var ComboHandler = {
  feedItems: {
    get: function(req, res) {
      var combined = [];
      var timeStamp = req.params.timeStamp;
      try {
        Transaction.findMostRecent(timeStamp).then(function(transactions) {
          combined = combined.concat(transactions);
          return JoinEvent.findMostRecent(timeStamp);
        }, function(err) {
          winston.log('error', 'Error finding transactions: %s', err.toString());
          throw err;
        }).then(function(joins) {
          combined = combined.concat(joins);
          return NewCategoryEvent.findMostRecent(timeStamp);
        }, function(err) {
          winston.log('error', 'Error finding join event: %s', err.toString());
          throw err;
        }).then(function(newCategories) {
          combined = combined.concat(newCategories);
          return AddExpertEvent.findMostRecent(timeStamp);
        }, function(err) {
          winston.log('error', 'Error finding new category event: %s', err.toString());
          throw err;
        }).then(function(ghosts) {
          combined = combined.concat(ghosts);
          return NewGhostEvent.findMostRecent(timeStamp);
        }, function(err) {
          winston.log('error', 'Error finding new ghost event: %s', err.toString());
          throw err;
        }).then(function(addExpertEvents) {
          combined = combined.concat(addExpertEvents);
          combined.sort(function(a,b) {
            return b.timeStamp - a.timeStamp;
          });
          return res.status(200).send(combined.slice(0,16));
        }, function(err) {
          winston.log('error', 'Error finding addexpert event: %s', err.toString());
          throw err;
        });
      }
      catch(err) {
        return res.status(503).send(err);
      }
    },
  },
};

module.exports = ComboHandler;
