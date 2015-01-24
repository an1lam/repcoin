'use strict';
var Category = require('../models/Category.js');
var Notification = require('../models/Notification.js');
var Transaction = require('../models/Transaction.js');
var User = require('../models/User.js');
var utils = require('./utils.js');
var winston = require('winston');

// Routes that end in /transactions
module.exports = function(router, isAuthenticated, acl) {
  function createTransaction(req, res) {
    // Validate the inputs given to createTransaction
    if (!utils.validateTransactionInputs(req)) {
      winston.log('info', 'Invalid transaction inputs');
      return res.status(412).send('Invalid transaction inputs');
    }

    var from = req.body.from;
    var to = req.body.to;
    var amount = Number(req.body.amount);
    var categoryName = req.body.category;
    var investmentId = req.body.id;
    var categoryIndex = -1;
    var portfolioIndex = -1;

    var transaction = new Transaction({
      to          : to,
      from        : from,
      amount      : amount,
      category    : categoryName
    });

    var fromUserPromise = User.findById(from.id).exec();
    var toUserPromise = User.findById(to.id).exec();

    var toUserCategoryTotal;
    var toUser;
    var fromUser;

    // Modify the toUser given the investment being made
    toUserPromise.then(function(touser) {
      for (var i = 0; i < touser.categories.length; i++) {
        if (touser.categories[i].name === categoryName) {
            touser.categories[i].reps = touser.categories[i].reps + amount;
            toUserCategoryTotal = touser.categories[i].reps;
            categoryIndex = i;
          }
        }

        if (categoryIndex === -1) {
          winston.log('info', 'Unable to find corresponding category for user %s and %s', toUser.name, categoryName);
          return res.status(400).send('Unable to find corresponding category');
        }
        toUser = utils.addInvestorToExpertCategory(touser, from.id, from.name, categoryIndex);
        return fromUserPromise;
    }, function(err) {
      winston.log('error', 'Error retrieving toUser promise: %s', err);
      return res.status(400).send(err);
    // Deal with the from user
    }).then(function(fromUser) {
      // Modify the from user given the investment being made
      portfolioIndex = utils.getPortfolioIndex(fromUser, categoryName);
      if (portfolioIndex === -1) {
        winston.log('info', 'Unable to find portfolio index for user %s and %s', fromUser.name, categoryName);
        return res.status(400).send('Unable to find portfolioIndex');
      }
      var updatedUser = utils.updateInvestorPortfolio(fromUser, toUser, categoryName, amount, toUserCategoryTotal, investmentId);
      if (!updatedUser) {
        winston.log('error', 'Error updating portfolio for %s', fromUser.username);
        return res.status(400).send('Error updating portfolio');
      }
      transaction.save(function(err) {
        if (err) {
          winston.log('error', 'Error saving transaction: %s', err);
          return res.status(400).send(err);
        } else {
          toUser.save(function(err) {
            if (err) {
              winston.log('error', 'Error saving toUser: %s', err);
              Transaction.findOneAndRemove({'id': transaction.id});
              return res.status(400).send(err);
            } else {
              fromUser.save(function(err) {
                if (err) {
                  winston.log('error', 'Error saving fromUser: %s', err);
                  Transaction.findOneAndRemove({'id': transaction.id});
                  toUser.categories[categoryIndex].reps -= amount;
                  toUser.save();
                  return res.status(400).send(err);
                } else {
                  // Update the expert percentiles
                  utils.updateExpertPercentiles(categoryName, function(err) {
                    if (err) {
                      winston.log('error', 'Error saving transaction: %s', err);
                      Transaction.findOneAndRemove({'id': transaction.id});
                      toUser.categories[categoryIndex].reps -= amount;
                      toUser.save();
                      fromUser.reps += amount;
                      fromUser.save();
                      return res.status(400).send(err);
                    } else {
                      // Update the investor percentiles and percentages
                      utils.updateInvestors(categoryName, function(err) {
                        if (err) {
                          winston.log('error', 'Error updating investors: %s', err);
                          Transaction.findOneAndRemove({'id': transaction.id});
                          toUser.categories[categoryIndex].reps -= amount;
                          toUser.save();
                          fromUser.reps += amount;
                          fromUser.save();
                          return res.status(400).send(err);
                        } else {

                          // Notify the to user of the transaction
                          var action;
                          if (amount < 0) {
                            action = ' revoked ' + amount * -1 + ' reps from you for ' + transaction.category;
                          } else {
                            action = ' gave ' + amount + ' reps to you for ' + transaction.category;
                          }
                          var from = transaction.anonymous ? 'Someone' : transaction.from.name;
                          var notification = new Notification({
                            user    : { id: transaction.to.id, name: transaction.to.name },
                            message : from + action,
                          });
                          notification.save();

                          return res.send(transaction);
                        }
                      }, toUser.username, toUserCategoryTotal);
                    }
                  });
                }
              });
            }
          });
        }
      });
    }, function(err) {
      winston.log('error', 'Error getting fromUser: %s', err);
      return res.status(400).send(err);
    }).end();
  }

  router.route('/transactions')
    // Get all the transactions, obscuring private fields
    .get(isAuthenticated, function(req, res) {
      Transaction.findPublic({}).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    })

    // Create a new transaction
    .post(isAuthenticated, acl.isAdminOrFrom, function(req, res) {
      createTransaction(req, res);
    });

///////// Routes that have /transcations/:transaction_id ////////
  router.route('/transactions/:transaction_id')
    // Get the transaction with this id
    .get(isAuthenticated, function(req, res) {
      Transaction.findByIdPublic(req.params.transaction_id).then(function(transaction) {
        return res.status(200).send(transaction);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    })

    // Update the transaction with this id
    .put(isAuthenticated, acl.isAdmin, function(req, res) {
      Transaction.findById(req.params.transaction_id, function(err, transaction) {
        if (err) {
          winston.log('error', 'Error finding transaction: %s', err);
          return res.status(503).send(err);
        } else {
          transaction.to          = req.body.to;
          transaction.from        = req.body.from;
          transaction.amount      = req.body.amount;
          transaction.category    = req.body.category;
          transaction.save(function(err) {
            if (err) {
              winston.log('error', 'Error saving transactions: %s', err);
              return res.status(503).send(err);
            } else {
              return res.status(200).send(transaction);
            }
          });
        }
      });
    })

   // Delete the transaction with this id
   .delete(isAuthenticated, acl.isAdmin, function(req, res) {
      // Remove the transaction
      Transaction.remove({ _id: req.params.transaction_id }, function(err, transaction) {
        if (err) {
          winston.log('error', 'Error removing transaction: %s', err);
          return res.status(503).send(err);
        } else {
          return res.status(200).send('Successfully deleted transaction');
        }
      });
   });

  router.route('/transactions/users/:user_id/all')
    // Get all of the transactions to or from a given user
    .get(isAuthenticated, acl.isAdmin, function(req, res) {
      Transaction.findByUserIdAll(req.params.user_id).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    });

  // Get all of the public transactions to or from a given user
  router.route('/transactions/users/:user_id/all/public')
    .get(isAuthenticated, function(req, res) {
      Transaction.findByUserIdAllPublic(req.params.user_id).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    });


  // Get all of the public transactions to a given user
  router.route('/transactions/users/:user_id/to/public')
    .get(isAuthenticated, function(req, res) {
      Transaction.findByUserIdToPublic(req.params.user_id).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    });

  // Get all of the transactions from a given user
  router.route('/transactions/users/:user_id/from')
    .get(isAuthenticated, acl.isAdmin, function(req, res) {
      Transaction.findByUserIdFrom(req.params.user_id).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    });

  // Get all of the public transactions from a given user
  router.route('/transactions/users/:user_id/from/public')
    .get(isAuthenticated, function(req, res) {
      Transaction.findByUserIdFromPublic(req.params.user_id).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    });

  // Get all of the public transactions between users
  router.route('/transactions/users/:user_id/us/public')
    .get(isAuthenticated, function(req, res) {
      Transaction.findByUserIdUsPublic(req.params.user_id, req.session.passport.user).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    });

  // Get all of the public transactions for a given category
  router.route('/transactions/categories/:categoryName')
    .get(isAuthenticated, function(req, res) {
      Transaction.findByCategoryPublic(req.params.categoryName).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    });
};
