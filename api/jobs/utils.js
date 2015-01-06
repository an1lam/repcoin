'use strict';

var Category = require('../models/Category.js');
var User = require('../models/User.js');
var winston = require('winston');

// Utility functions for jobs
var utils = {
  incrementInvestorReps: function(job, done) {
    var i = 0;
    User.find(function(err, users) {
      if (err) {
        winston.log('error', 'Error incrementing investor reps: %s', err.toString());
      } else {
        users.forEach(function(user) {
          user.portfolio.forEach(function(entry) {
            if (entry.reps === 0) {

              // Add reps to the category model
              var category = Category.findByName(entry.category).then(function(category) {
                category.reps += 5;
                category.save();
              }, function(err) {
                winston.log('info', 'Error finding category: %s', entry.category);
              });

              // Add reps to the user
              entry.reps += 5;
            }
          });
          user.save();
        });
        winston.log('info', 'Incrementing investor reps');
      }
    });
  },

  setPreviousPercentileToCurrent: function(job, done) {
    var i = 0;
    User.find(function(err, users) {
      if (err) {
        winston.log('error', 'Error setting previous percentiles to current: %s', err.toString());
      } else {
        users.forEach(function(user) {
          user.categories.forEach(function(category) {
            category.previousPercentile = category.percentile;
          });
          user.save();
        });
        winston.log('info', 'Updating %d users\' previous percentiles.', users.length);
      }
    });
  },
};

module.exports = utils;
