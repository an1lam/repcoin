'use strict';
var winston = require('winston');

var JoinEvent = require('../models/JoinEvent.js');
var NewCategoryEvent = require('../models/NewCategoryEvent.js');
var Transaction = require('../models/Transaction.js');

var ComboHandler = {
  feedItems: {
    get: function(req, res) {
      var combined = [];

      try {
        Transaction.findPublic({}).then(function(transactions) {
          combined = combined.concat(transactions);
          return JoinEvent.find().exec();
        }, function(err) {
          winston.log('error', 'Error finding transactions: %s', err.toString());
          throw err;
        }).then(function(joins) {
          combined = combined.concat(joins);
          return NewCategoryEvent.find().exec();
        }, function(err) {
          winston.log('error', 'Error finding join event: %s', err.toString());
          throw err;
        }).then(function(newCategories) {
          combined = combined.concat(newCategories);
          combined.sort(function(a,b) {
            return b.timeStamp - a.timeStamp;
          });
          return res.status(200).send(combined);
        }, function(err) {
          winston.log('error', 'Error finding new category event: %s', err.toString());
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
