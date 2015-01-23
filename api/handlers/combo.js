'use strict';
var winston = require('winston');

var JoinEvent = require('../models/JoinEvent.js');
var Transaction = require('../models/Transaction.js');

var ComboHandler = {
  feedItems: {
    get: function(req, res) {
      Transaction.findPublic({}).then(function(transactions) {
        JoinEvent.find().exec().then(function(evts) {
          var combined = transactions.concat(evts);
          combined.sort(function(a,b) {
            return b.timeStamp - a.timeStamp;
          });
          return res.status(200).send(combined);
        }, function(err) {
          winston.log('error', 'Error finding transactions: %s', err.toString());
          return res.status(503).send(err);
        });
      }, function(err) {
        winston.log('error', 'Error finding join event: %s', err.toString());
        return res.status(503).send(err);
      });
    },
  },
};

module.exports = ComboHandler;
