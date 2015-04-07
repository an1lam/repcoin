'use strict';

var Q = require('q');
var Category = require('../api/models/Category.js');
var routeUtils = require('../api/routes/utils.js');
var Transaction = require('../api/models/Transaction.js');
var User = require('../api/models/User.js');
var UserSnapshot = require('../api/models/UserSnapshot.js');
var winston = require('winston');

var DIVIDEND_PERCENTAGE = 0.1;

// Utility functions for jobs
var utils = {

  // DEPRECATED
  // Migrate rank to all users
  // Does not handle rank properly
  migrateRankToUsers: function(cb) {
    var categories;

    // Update rank for investors and experts for a given category name
    var updateAllRank = function(categoryName, cb) {
      // Updates all of the users' ranks for a given category name
      // Set expert to true for categories, false for portfolio
      var updateRank =  function(categoryName, expert) {
        var query;
        if (expert) {
          query = User.findRankedExperts(categoryName);
        } else {
          query = User.findRankedInvestors(categoryName);
        }

        return query.then(function(results) {
          var i = -1;
          return Q.all(results.map(function(result) {
            i++;
            return User.updateRank(result._id, categoryName, i+1, expert).then(function() { });
          }));
        });
      };

      return updateRank(categoryName, true).then(function() {
        return updateRank(categoryName, false).then(function() {
          winston.log('info', 'Finished updating rank for category: %s', categoryName);
        });
      });
    };

    winston.log('info', 'Fetching categories...');
    Category.find().exec().then(function(categories) {
      return Q.all(categories.map(function(category) {
        return updateAllRank(category.name).then(function() {}, function(err) {
          if (err) {
            winston.log('error', 'Error updating rank: %s', err.toString());
          }
        });
      }));
    }).then(function(results) {
      winston.log('info', 'Successfully updated users.');
      cb(null);
    }, function(err) {
      winston.log('error', 'Error updating users: %s', err.toString());
      cb(err);
    });
  },

  // Migrate rank to all user snapshots
  migrateRankToUserSnapshots: function(cb) {
    var categories;

    // Update rank for investors and experts for a given category name
    var updateAllRank = function(categoryName, start, end, cb) {
      // Updates all of the users' ranks for a given category name
      // Set expert to true for categories, false for portfolio
      var updateRank =  function(categoryName, start, end, expert) {
        var query;
        if (expert) {
          query = UserSnapshot.findRankedExperts(categoryName, start, end);
        } else {
          query = UserSnapshot.findRankedInvestors(categoryName, start, end);
        }

        return query.then(function(results) {
          var i = -1;
          return Q.all(results.map(function(result) {
            i++;
            return UserSnapshot.updateRank(result._id, categoryName, i+1, expert).then(function() { });
          }));
        });
      };

      return updateRank(categoryName, start, end, true).then(function() {
        return updateRank(categoryName, start, end, false).then(function() {
          winston.log('info', 'Finished updating rank for category: %s', categoryName);
        });
      });
    };

    var categoryPromise = Category.find().exec();
    var uniqueDatePromise = UserSnapshot.aggregate([
      { $group: { _id: { month: { $month: "$timeStamp" }, day: { $dayOfMonth: "$timeStamp" }}} }]).exec();

    // Get all of the categories
    winston.log('info', 'Fetching categories...');
    categoryPromise.then(function(categoriess) {
      winston.log('info', 'Fetching unique days...');
      categories = categoriess;
      return uniqueDatePromise;
    }, function(err) {
      winston.log('error', 'Error migrating user snapshots: %s', err.toString());
      return cb(err);
    }).then(function(times) {
      var month, day, start, end;
      return Q.all(times.map(function(time) {
        month = time._id.month - 1;
        day = time._id.day;
        winston.log('info', 'Examining month %s and day %s', month, day);
        start = new Date(2015, month, day);
        end = new Date(2015, month, day+1);
        return Q.all(categories.map(function(category) {
          return updateAllRank(category.name, start, end).then(function() {}, function(err) {
            if (err) {
              winston.log('error', 'Error updating rank: %s', err.toString());
            }
          });
        }));
      }));
    }).then(function(results) {
      winston.log('info', 'Successfully updated user snapshots.');
      cb(null);
    }, function(err) {
      winston.log('error', 'Error updating user snapshots: %s', err.toString());
      cb(err);
    });
  },

  // Remove investors from categories for which they hold no investments
  // Necessary because of the change to automatically enter and leave an investor category
  removeInvestorsWithNoInvestments: function(cb) {
    User.find(function(err, users) {
      if (err) {
        winston.log('error', 'Error removing investors with no investments: %s', err.toString());
        cb(null);
      } else {
        var user, newPortfolio;
        for (var i = 0; i < users.length; i++) {
          user = users[i];
          newPortfolio = [];
          for (var j = 0; j < user.portfolio.length; j++) {
            if (user.portfolio[j].investments.length > 0) {
              newPortfolio.push(user.portfolio[j]);
            }
          }
          user.portfolio = newPortfolio;
        };
        routeUtils.saveAll(users, function(errs) {
          if (errs.length > 0) {
            winston.log('error', 'Error removing investors with no investments: %s', errs.toString());
            cb(errs);
          } else {
            winston.log('info', 'Successfully removed investors with no investments.');
            cb(null);
          }
        });
      }
    });
  },

  removeInvestorsWithRankZero: function(cb) {
    User.find({'portfolio.rank' : 0}, function(err, users) {
      if (err) {
        winston.log('error', 'Error removing investors with rank zero: %s', err.toString());
        cb(null);
      } else if (users.length === 0) {
        cb(null);
      } else {
        var user;
        for (var i = 0; i < users.length; i++) {
          user = users[i];
          var newPortfolio = [];
          for (var j = 0; j < user.portfolio.length; j++) {
            if (user.portfolio[j].rank !== 0) {
              newPortfolio.push(user.portfolio[j]);
            }
          }
          user.portfolio = newPortfolio;
        }

        routeUtils.saveAll(users, function(errs) {
          if (errs.length > 0) {
            winston.log('error', 'Error removing investors with rank zero: %s', errs.toString());
            cb(errs);
          } else {
            winston.log('info', 'Successfully removed investors with rank zero.');
            cb(null);
          }
        });
      }
    });
  },

  incrementInvestorReps: function(cb) {
    var i = 0;
    User.find(function(err, users) {
      if (err) {
        winston.log('error', 'Error incrementing investor reps: %s', err.toString());
        cb();
      } else {
        users.forEach(function(user) {
          if (Math.floor(user.reps * 100)/100 <= 0) {
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

  removeInappropriateUsers: function(cb) {
    var inappropriateUsernames = [
      'robert frost',
      'Barack Obama',
    ];

    // Remove all the users with inappropriate names
    User.remove({ 'username': { $in: inappropriateUsernames }}, function(err) {
      if (err) {
        winston.log('error', 'Error removing inappropriate users: %s', err.toString());
        cb(err);
      } else {
        winston.log('info', 'Successfully removed inappropriate users docs.');

        // Remove all of the transactions involving those users
        Transaction.remove({ $or: [ { "to.name" : { $in: inappropriateUsernames }}, { "from.name" : { $in: inappropriateUsernames }} ] }, function(err) {
          if (err) {
            winston.log('error', 'Error removing transaction docs: %s', err.toString());
            cb(err);
          } else {
            winston.log('info', 'Successfully removed inappropriate users');
            cb(null);
          }
        });
      }
    });
  },

  // CAREFUL
  // NOT TO BE USED MORE THAN ONCE
  // SETS ALL PERCENTILES TO 50, REPS TO 10, and DELETES INVESTMENTS!
  resetCategoriesAndInvestments: function(cb) {
    // The list of names that need to be removed
    var inappropriateNames = [
      'aftereffects',
      'air bending',
      'andrew lindner',
      'banjo',
      'bipartisanship',
      'bitcoin',
      'buffoonary',
      'dueling',
      'e-mails',
      'expertise',
      'fox',
      'fox hunting',
      'hpc',
      'im sports',
      'investing',
      'microsoft word',
      'native relations',
      'photoshp',
      'pilot',
      'pointing',
      'politics',
      'production scheduling',
      'raptor jesus',
      'reps',
      'sex',
      'spelling',
      'television',
      'will baird',
    ];

    // Remove all the categories with inappropriate names
    Category.remove({ 'name': { $in: inappropriateNames }}, function(err) {
      if (err) {
        winston.log('error', 'Error removing inappropriate categories: %s', err.toString());
        cb(err);
      } else {
        winston.log('info', 'Successfully removed inappropriate category docs.');

        // Remove all of the transactions for those inappropriate categories
        Transaction.remove({ 'category': { $in: inappropriateNames }}, function(err) {
          if (err) {
            winston.log('error', 'Error removing inappropriate categories: %s', err.toString());
            cb(err);
          } else {
            // Reset user data
            User.find(function(err, users) {
              if (err) {
                winston.log('error', 'Error removing inappropriate categories: %s', err.toString());
                cb(err);
              } else {
                var user, newCategories, newPortfolio;
                for (var i = 0; i < users.length; i++) {
                  user = users[i];
                  newCategories = [];
                  newPortfolio = [];

                  // Reset every user's investors
                  // Give every early expert 10 reps
                  for (var j = 0; j < user.categories.length; j++) {

                    // Only include categories that are not being destroyed
                    if (inappropriateNames.indexOf(user.categories[j].name) <= -1) {
                      user.categories[j].investors = [];
                      user.categories[j].reps = 10;
                      user.categories[j].percentile = 50;
                      user.categories[j].previousPercentile = 50;
                      newCategories.push(user.categories[j]);
                    }
                  }

                  // Remove every user's investments
                  // Give every early investor 15 reps
                  for (var j = 0; j < user.portfolio.length; j++) {
                    // Only include categories that are not being destroyed
                    if (inappropriateNames.indexOf(user.portfolio[j].category) <= -1) {
                      user.portfolio[j].investments = [];
                      user.portfolio[j].percentile = 50;
                      user.portfolio[j].previousPercentile = 50;
                      newPortfolio.push(user.portfolio[j]);
                    }
                  }
                  user.categories = newCategories;
                  user.portfolio = newPortfolio;
                  user.reps = 15;
                }

                // Save all of the updated users
                routeUtils.saveAll(users, function(errs) {
                  if (errs.length > 0) {
                    winston.log('error', 'Error removing inappropriate categories: %s', errs.toString());
                    cb(errs);
                  } else {
                    winston.log('info', 'Successfully updated user docs.');
                    cb(null);
                  }
                });
              }
            });
          }
        });
      }
    });
  },

  setPreviousRankToCurrent: function(cb) {
    var i = 0;
    User.find(function(err, users) {
      if (err) {
        cb();
        winston.log('error', 'Error setting previous ranks to current: %s', err.toString());
      } else {
        users.forEach(function(user) {
          user.categories.forEach(function(category) {
            category.previousRank = category.rank;
          });
        });
        routeUtils.saveAll(users, function(errs) {
          if (errs.length > 0) {
            winston.log('error', 'Error updating ranks: %s', errs);
            cb(errs);
          } else {
            winston.log('info', 'Successfully migrated ranks.');
            cb(null);
          }
        });
      }
    });
  },

  resetBetaMarket: function(cb) {
    User.find(function(err, users) {
      if (err) {
        winston.log('error', 'Error resetting beta market: %s', err.toString());
        cb();
      } else {
        for (var j = 0; j < users.length; j++)  {
          var user = users[j];

          // Every user starts with 5 reps regardless
          user.reps = 5;

          for (var i = 0; i < user.portfolio.length; i++) {

            // Give 5 reps for every category for which the investor was number 1
            if (user.portfolio[i].rank === 1) {
              user.reps += 5;
            }
          }

          // Set the portfolio to empty
          user.portfolio = [];

          for (var i = 0; i < user.categories.length; i++) {
            user.categories[i].reps = 5;
            user.categories[i].rank = 1;
            user.categories[i].investors = [];
          }
        }
        Category.find(function(err, categories) {
          if (err) {
            winston.log('error', 'Error resetting beta market: %s', err.toString());
            cb();
          } else {
            var category;
            for (var i = 0; i < categories.length; i++) {
              category = categories[i];
              category.reps = category.experts * 5;
              category.investors = 0;
            }
          }
          var docs = users.concat(categories);
          routeUtils.saveAll(docs, function(errs) {
            if (errs.length > 0) {
              winston.log('error', 'Error resetting beta market: %s', errs);
              cb(errs);
            } else {
              winston.log('info', 'Successfully reset beta market.');
              cb(null);
            }
          });
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

            // Get the total number of reps the user has invested for this category
            var investorRepsInvested = 0;
            for (var j = 0; j < category.investments.length; j++) {
              var investment = category.investments[j]
              investorRepsInvested += investment.amount;
            }

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

                  // Reset the dividend and pay the dividend
                  var dividend = Math.floor(investment.percentage * (total - investorRepsInvested) * DIVIDEND_PERCENTAGE * 100)/100;
                  investment.dividend = dividend;
                  user.reps += dividend;
                  user.reps = Math.floor(user.reps * 100)/100;

                  // If the user now has negative reps, make their reps 0
                  if (user.reps < 0) {
                    user.reps = 0;
                  }
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

  // Recounts the reps, experts, and investors for a category
  // Experts: number of experts in the category
  // Invetors: number of investors in the category
  // Reps: number of reps that experts in the category hold
  recountCategoryRepsExpertsAndInvestors: function(cb) {
    User.find(function(err, users) {
      if (err) {
        winston.log('error', 'Error recounting category fields: %s', err.toString());
        return cb();
      } else {
        Category.find(function(err, categories) {
          if (err) {
            winston.log('error', 'Error recounting category fields: %s', err.toString());
            return cb();
          } else {
            var category, totalReps, user, experts, investors;

            // Go through each category
            for (var i = 0; i < categories.length; i++) {
              category = categories[i];
              totalReps = 0;
              experts = 0;
              investors = 0;

              // Go through all of the users
              for (var j = 0; j < users.length; j++) {
                user = users[j];

                // If a user is an expert for that category, increment experts and reps
                for (var p = 0; p < user.categories.length; p++) {
                  if (user.categories[p].name === category.name) {
                    experts++;
                    totalReps += user.categories[p].reps;
                  }
                }

                // If a user is an investor for that category, increment investors
                for (var p = 0; p < user.portfolio.length; p++) {
                  if (user.portfolio[p].category === category.name) {
                    investors++;
                  }
                }
              }

              // Reset the category fields and save
              category.reps = Math.floor(totalReps * 100)/100;
              category.experts = experts;
              category.investors = investors;
              routeUtils.saveAll(categories, function(errs) {
                if (errs.length > 0) {
                  winston.log('error', 'Error recounting category fields: %s', errs);
                  return cb(errs);
                } else {
                  winston.log('info', 'Successfully recounted category fields.');
                  return cb(null);
                }
              });
            }
          }
        });
      }
    });
  },

  // Make investor reps at the same level as the portfolio
  // Make an investor\'s reps the sum of their reps for each portfolio entry
  // TO BE USED ONCE ONLY TO MIGRATE TO THE NEW REPS MODEL
  migrateInvestorReps: function(cb) {
    User.find(function(err, users) {
      if (err) {
        winston.log('error', 'Error migrating investor reps: %s', err.toString());
        cb();
      } else {
        var user, totalReps;
        for (var i = 0; i < users.length; i++) {
          user = users[i];
          totalReps = 0;
          for (var j = 0; j < user.portfolio.length; j++) {
            if (user.portfolio[j].reps) {
              totalReps += user.portfolio[j].reps;
            }
          }
          user.reps = Math.floor(totalReps * 100)/100;
        };
        routeUtils.saveAll(users, function(errs) {
          if (errs.length > 0) {
            winston.log('error', 'Error migrating investor reps: %s', errs);
            cb(errs);
          } else {
            winston.log('info', 'Successfully migrated investor reps.');
            cb(null);
          }
        });
      }
    });
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
