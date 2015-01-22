'use strict';

var Category = require('../api/models/Category.js');
var routeUtils = require('../api/routes/utils.js');
var Transaction = require('../api/models/Transaction.js');
var User = require('../api/models/User.js');
var winston = require('winston');

var DIVIDEND_PERCENTAGE = 0.1;

// Utility functions for jobs
var utils = {
  incrementInvestorReps: function(cb) {
    var i = 0;
    User.find(function(err, users) {
      if (err) {
        winston.log('error', 'Error incrementing investor reps: %s', err.toString());
        cb();
      } else {
        users.forEach(function(user) {
          if (Math.floor(user.reps * 100)/100 === 0) {
            user.reps = 5;
          }
          user.reps = Math.floor(user.reps * 100)/100;
        });
        routeUtils.saveAll(users, function(errs) {
          if (errs.length > 0) {
            winston.log('error', 'Error incrementing investor reps: %s', errs);
            cb(errs);
          } else {
            winston.log('info', 'Successfully incremented investor reps.');
            cb(null);
          }
        });
      }
    });
  },

  setPreviousPercentileToCurrent: function(cb) {
    var i = 0;
    User.find(function(err, users) {
      if (err) {
        cb();
        winston.log('error', 'Error setting previous percentiles to current: %s', err.toString());
      } else {
        users.forEach(function(user) {
          user.categories.forEach(function(category) {
            category.previousPercentile = category.percentile;
          });
        });
        routeUtils.saveAll(users, function(errs) {
          if (errs.length > 0) {
            winston.log('error', 'Error migrating percentiles and dividends: %s', errs);
            cb(errs);
          } else {
            winston.log('info', 'Successfully migrated percentages and dividends.');
            cb(null);
          }
        });
      }
    });
  },

  payDividends: function(cb) {
    function getUserById(users, id) {
      for (var i = 0; i < users.length; i++) {
        if (users[i]._id.toString() === id.toString()) {
          return users[i];
        }
      }
    };

    function getCategoryTotal(expert, categoryName) {
      for (var i = 0; i < expert.categories.length; i++) {
        var category = expert.categories[i];
        if (category.name === categoryName) {
          return category.reps;
        }
      }
    }

    User.find(function(err, users) {
      if (err) {
        winston.log('error', 'Error paying dividends: %s', err.toString());
        cb();
      } else {
        users.forEach(function(user) {
          for (var i = 0; i < user.portfolio.length; i++) {
            var category = user.portfolio[i];
            var categoryName = category.category;
            for (var j = 0; j < category.investments.length; j++) {
              var investment = category.investments[j];
              var percentage = investment.percentage;
              var expert = getUserById(users, investment.userId);
              if (!expert) {
                winston.log('error', 'Error finding user with id: %s', investment.userId);
              } else {
                var total = getCategoryTotal(expert, categoryName);
                if (!total) {
                  winston.log('error', 'Error finding expected expert category for user with id: %s');
                } else {
                  var dividend = Math.floor(investment.percentage * total * DIVIDEND_PERCENTAGE * 100)/100;
                  investment.dividend = dividend;
                  user.reps += dividend;
                  user.reps = Math.floor(user.reps * 100)/100;
                }
              }
            };
          };
        });
        routeUtils.saveAll(users, function(errs) {
          if (errs.length > 0) {
            winston.log('error', 'Error migrating percentiles and dividends: %s', errs);
            cb(errs);
          } else {
            winston.log('info', 'Successfully migrated percentages and dividends.');
            cb(null);
          }
        });
      }
    });
  },

  // Make all category names lowercase
  // To be used ONCE ONLY to migrate category name
  makeCategoryNamesLowerCase: function(cb) {
    function lowerUserModelCategories(cb, cbParams) {
      User.find(function(err, users) {
        if (err) {
          winston.log('error', 'Error changing case of category names in user documents: %s', err.toString());
          cb1(cb);
        } else {
          users.forEach(function(user) {
            // Change every field of portfolio.category
            for (var i = 0; i < user.portfolio.length; i++) {
              user.portfolio[i].category = user.portfolio[i].category.toLowerCase();
            };

            // Change every field of catgories.name
            for (var i = 0; i < user.categories.length; i++) {
              user.categories[i].name = user.categories[i].name.toLowerCase();
            };
          });
          routeUtils.saveAll(users, function(errs) {
            if (errs.length > 0) {
              winston.log('error', 'Error converting category names to lowercase: %s', errs);
            } else {
              winston.log('info', 'Successfully converted user category names to lowercase.');
            }
            cb(cbParams[0], cbParams.slice(1, cbParams.length));
          });
        }
      });
    };

    function lowerCategoryModelNames(cb, cbParams) {
      Category.find(function(err, categories) {
        if (err) {
          winston.log('error', 'Error changing case of category names in category documents: %s', err.toString());
          cb1(cb);
        } else {
          categories.forEach(function(category) {
            // Change category.name
            category.name = category.name.toLowerCase();
          });
          routeUtils.saveAll(categories, function(errs) {
            if (errs.length > 0) {
              winston.log('error', 'Error converting category names to lowercase: %s', errs);
            } else {
              winston.log('info', 'Successfully converted category model names to lowercase.');
            }
            cb(cbParams[0], cbParams.slice(1, cbParams.length));
          });
        }
      });
    }

    function lowerTransactionModelCategoryNames(cb) {
      Transaction.find(function(err, transactions) {
        if (err) {
          winston.log('error', 'Error changing case of category names in transaction documents: %s', err.toString());
          cb();
        } else {
          transactions.forEach(function(transaction) {
            // Change transaction.category
            transaction.category = transaction.category.toLowerCase();
          });
          routeUtils.saveAll(transactions, function(errs) {
            if (errs.length > 0) {
              winston.log('error', 'Error converting category names to lowercase: %s', errs);
              cb();
            } else {
              winston.log('info', 'Successfully converted transaction model documents to lowercase.');
              cb();
            }
          });
        }
      });
    }

    lowerUserModelCategories(lowerCategoryModelNames, [lowerTransactionModelCategoryNames, cb]);
  },

  // Divide all user percentages by 100
  // Give all investments a dividend
  // To be used ONCE ONLY to migrate to the dividend system
  migratePercentagesAndDividends: function(cb) {
    function getUserById(users, id) {
      for (var i = 0; i < users.length; i++) {
        if (users[i]._id.toString() === id.toString()) {
          return users[i];
        }
      }
    };

    function getCategoryTotal(expert, categoryName) {
      for (var i = 0; i < expert.categories.length; i++) {
        var category = expert.categories[i];
        if (category.name === categoryName) {
          return category.reps;
        }
      }
    }

    User.find(function(err, users) {
      if (err) {
        winston.log('error', 'Error migrating percentages and dividends: %s', err.toString());
        cb();
      } else {
        users.forEach(function(user) {
          for (var i = 0; i < user.portfolio.length; i++) {
            var category = user.portfolio[i];
            var categoryName = category.category;
            for (var j = 0; j < category.investments.length; j++) {
              var investment = category.investments[j];
              investment.percentage /= 100;
              var expert = getUserById(users, investment.userId);
              if (!expert) {
                winston.log('error', 'Error finding user with id: %s', investment.userId.toString());
                investment.dividend = 0;
              } else {
                var total = getCategoryTotal(expert, categoryName);
                if (!total) {
                  winston.log('error', 'Error finding expected expert category for user with id: %s');
                  investment.dividend = 0;
                } else {
                  var dividend = Math.floor(investment.percentage * total * DIVIDEND_PERCENTAGE * 100)/100;
                  investment.dividend = dividend;
                }
              }
            };
          };
        });
        routeUtils.saveAll(users, function(errs) {
          if (errs.length > 0) {
            winston.log('error', 'Error migrating percentiles and dividends: %s', errs);
            cb(errs);
          } else {
            winston.log('info', 'Successfully migrated percentages and dividends.');
            cb(null);
          }
        });
      }
    });
  },
};

module.exports = utils;
