'use strict';

var Category = require('../models/Category.js');
var User = require('../models/User.js');
var winston = require('winston');

var DIVIDEND_PERCENTAGE = 0.1;

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

  getCategoryTotal: function(expert, categoryName) {
    for (var i = 0; i < expert.categories.length; i++) {
      var category = expert.categories[i];
      if (category.name === categoryName) {
        return category.reps;
      }
    }
    return null;
  },

  payDividends: function(job, done) {
    var self = this;
    User.find(function(err, users) {
      if (err) {
        winston.log('error', 'Error paying dividends: %s', err.toString());
      } else {
        users.forEach(function(user) {
          user.portfolio.forEach(function(category) {
            var categoryName = category.category;
            category.investments.forEach(function(investment) {
              var percentage = investment.percentage;
              User.findById(investment.userId, function(err, expert) {
                if (err) {
                  winston.log('error', 'Error finding user with id: %s', investment.userId);
                } else {
                  var total = self.getCategoryTotal(expert, categoryName);
                  if (!total) {
                    winston.log('error', 'Error finding expected expert category for user with id: %s');
                  } else {
                    var dividend = Math.floor(investment.percentage * total * DIVIDEND_PERCENTAGE * 100)/100;
                    investment.dividend = dividend;
                    category.reps += dividend;
                  }
                }
              });
            });
          });
          user.save();
        });
        winston.log('info', 'Paid dividends.');
      }
    });
  },

  // Divide all user percentages by 100
  // Give all investments a dividend
  // To be used ONCE ONLY to migrate to the dividend system
  migratePercentagesAndDividends: function(job, done) {
    var self = this;
    User.find(function(err, users) {
      if (err) {
        winston.log('error', 'Error migrating percentages and dividends: %s', err.toString());
      } else {
        users.forEach(function(user) {
          user.portfolio.forEach(function(category) {
            var categoryName = category.category;
            category.investments.forEach(function(investment) {
              investment.percentage /= 100;
              User.findById(investment.userId, function(err, expert) {
                if (err) {
                  winston.log('error', 'Error finding user with id: %s', investment.userId);
                  investment.dividend = 0;
                } else {
                  var total = self.getCategoryTotal(expert, categoryName);
                  if (!total) {
                    winston.log('error', 'Error finding expected expert category for user with id: %s');
                    investment.dividend = 0;
                  } else {
                    var dividend = Math.floor(investment.percentage * total * DIVIDEND_PERCENTAGE * 100)/100;
                    investment.dividend = dividend;
                  }
                }
              });
            });
          });
          user.save();
        });
      }
    });
  },
};

module.exports = utils;
