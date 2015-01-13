'use strict';
var Category = require('../models/Category.js');
var Transaction = require('../models/Transaction.js');
var User = require('../models/User.js');
var utils = require('./utils.js');
var winston = require('winston');

// Routes that end in /transactions
module.exports = function(router, isAuthenticated, acl) {
  function createTransaction(req, res) {
    winston.log('info', 'Creating transaction');
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

    // Check that there is a user logged in
    if (!req.user) {
      winston.log('info', 'Could not create transaction, no user logged in');
      return res.status(400).send('No user logged in');
    }

    // Check that the user is the same as from
    if (req.user._id != req.body.from.id) {
      winston.log('info', 'Incorrect user: %s does not match %s', from.name, req.user.username);
      return res.status(400).send('Incorrect user: ' + from.name + 'does not match ' + req.user.username);
    }

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
      var portfolio = utils.updateInvestorPortfolio(fromUser.portfolio,
        categoryName, to, amount, toUserCategoryTotal, investmentId);
      if (!portfolio) {
        winston.log('error', 'Error updating portfolio for user: %s', fromUser.name);
        return res.status(400).send('Error updating portfolio');
      }
      fromUser.portfolio = portfolio;
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
                      fromUser.portfolio[portfolioIndex].reps += amount;
                      fromUser.save();
                      return res.status(400).send(err);
                    } else {
                      // Update the investor percentiles, valuations, and percentages
                      utils.updateInvestors(categoryName, function(err) {
                        if (err) {
                          winston.log('error', 'Error updating investors: %s', err);
                          Transaction.findOneAndRemove({'id': transaction.id});
                          toUser.categories[categoryIndex].reps -= amount;
                          toUser.save();
                          fromUser.portfolio[portfolioIndex].reps += amount;
                          fromUser.save();
                          return res.status(400).send(err);
                        } else {
                          winston.log('info', 'Successfully created transaction: %s', transaction._id.toString());
                          return res.send(transaction);
                        }
                      }, toUser.name, toUserCategoryTotal);
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
      winston.log('info', 'GET /transactions');
      Transaction.findPublic({}).then(function(transactions) {
        winston.log('info', 'Found all transactions');
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    })

    // Create a new transaction
    .post(isAuthenticated, acl.isAdminOrFrom, function(req, res) {
      winston.log('info', 'POST /transactions');
      createTransaction(req, res);
    });

///////// Routes that have /transcations/:transaction_id ////////
  router.route('/transactions/:transaction_id')
    // Get the transaction with this id
    .get(isAuthenticated, function(req, res) {
      winston.log('info', 'GET /transactions/%s', req.params.transaction_id);
      Transaction.findByIdPublic(req.params.transaction_id).then(function(transaction) {
        winston.log('info', 'Found transactions with id: %s', req.params.transaction_id);
        return res.status(200).send(transaction);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    })

    // Update the transaction with this id
    .put(isAuthenticated, acl.isAdmin, function(req, res) {
      winston.log('info', 'PUT /transactions/%s', req.params.transaction_id);
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
              winston.log('info', 'Saved transaction with id: %s', transaction._id);
              return res.status(200).send(transaction);
            }
          });
        }
      });
    })

   // Delete the transaction with this id
   .delete(isAuthenticated, acl.isAdmin, function(req, res) {
      winston.log('info', 'DELETE /transactions/:%s', req.params.transaction_id);
      // Remove the transaction
      Transaction.remove({ _id: req.params.transaction_id }, function(err, transaction) {
        if (err) {
          winston.log('error', 'Error removing transaction: %s', err);
          return res.status(503).send(err);
        } else {
          winston.log('info', 'Deleted transaction with id: %s', req.params.transaction_id);
          return res.status(200).send('Successfully deleted transaction');
        }
      });
   });

  router.route('/transactions/users/:user_id/all')
    // Get all of the transactions to or from a given user
    .get(isAuthenticated, acl.isAdmin, function(req, res) {
      winston.log('info', 'GET /transactions/users/%s/all', req.params.user_id);
      Transaction.findByUserIdAll(req.params.user_id).then(function(transactions) {
        winston.log('info', 'Found all transactions related to user: %s', req.params.user_id);
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    });

  // Get all of the public transactions to or from a given user
  router.route('/transactions/users/:user_id/all/public')
    .get(isAuthenticated, function(req, res) {
      winston.log('info', 'GET /transactions/users/%s/all/public', req.params.user_id);
      Transaction.findByUserIdAllPublic(req.params.user_id).then(function(transactions) {
        winston.log('info', 'Found all transactions related to user: %s', req.params.user_id);
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    });


  // Get all of the public transactions to a given user
  router.route('/transactions/users/:user_id/to/public')
    .get(isAuthenticated, function(req, res) {
      winston.log('info', 'GET /transactions/users/%s/to/public', req.params.user_id);
      Transaction.findByUserIdToPublic(req.params.user_id).then(function(transactions) {
        winston.log('info', 'Found transactions to user: %s', req.params.user_id);
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    });

  // Get all of the transactions from a given user
  router.route('/transactions/users/:user_id/from')
    .get(isAuthenticated, acl.isAdmin, function(req, res) {
      winston.log('info', 'GET /transactions/users/%s/from', req.params.user_id);
      Transaction.findByUserIdFrom(req.params.user_id).then(function(transactions) {
        winston.log('info', 'Found transactions from user: %s', req.params.user_id);
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    });

  // Get all of the public transactions from a given user
  router.route('/transactions/users/:user_id/from/public')
    .get(isAuthenticated, function(req, res) {
      winston.log('info', 'GET /transactions/users/%s/from/public', req.params.user_id);
      Transaction.findByUserIdFromPublic(req.params.user_id).then(function(transactions) {
        winston.log('info', 'Found transactions from user: %s', req.params.user_id);
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    });

  // Get all of the public transactions between users
  router.route('/transactions/users/:user_id/us/public')
    .get(isAuthenticated, function(req, res) {
      winston.log('info', 'GET /transactions/users/%s/us/public', req.params.user_id);
      Transaction.findByUserIdUsPublic(req.params.user_id, req.session.passport.user).then(function(transactions) {
        winston.log('info', 'Found transactions between users: %s, %s', req.params.user_id, req.session.passport.user);
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    });

  // Get all of the public transactions for a given category
  router.route('/transactions/categories/:categoryName')
    .get(isAuthenticated, function(req, res) {
      winston.log('info', 'GET /transactions/categories/%s', req.params.categoryName);
      Transaction.findByCategoryPublic(req.params.categoryName).then(function(transactions) {
        winston.log('info', 'Found transactiosn for category: %s', req.params.categoryName);
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err);
        return res.status(503).send(err);
      });
    });
};
