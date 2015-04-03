'use strict';
var winston = require('winston');

var AddExpertEvent = require('../models/AddExpertEvent.js');
var JoinEvent = require('../models/JoinEvent.js');
var NewCategoryEvent = require('../models/NewCategoryEvent.js');
var Transaction = require('../models/Transaction.js');

var ComboHandler = {
  feedItems: {
    get: function(req, res) {
      var combined = [];
      var timeStamp = req.params.timeStamp;
      Transaction.findMostRecent(timeStamp).then(function(transactions) {
        combined = combined.concat(transactions);
        return JoinEvent.findMostRecent(timeStamp);
      }).then(function(joins) {
        combined = combined.concat(joins);
        return NewCategoryEvent.findMostRecent(timeStamp);
      }).then(function(newCategories) {
        combined = combined.concat(newCategories);
        return AddExpertEvent.findMostRecent(timeStamp);
      }).then(function(addExpertEvents) {
        combined = combined.concat(addExpertEvents);
        combined.sort(function(a,b) {
          return b.timeStamp - a.timeStamp;
        });
        return res.status(200).send(combined.slice(0,16));
      }, function(err) {
        winston.log('error', 'Error finding addexpert event: %s', err.toString());
        return res.status(503).send(err);
      });
    },
  },
};

module.exports = ComboHandler;
