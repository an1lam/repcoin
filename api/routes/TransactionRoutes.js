'use strict';
var Category = require('../models/Category.js');
var Transaction = require('../models/Transaction.js');
var User = require('../models/User.js');
var utils = require('./utils.js');

// Routes that end in /transactions
module.exports = function(router, isAuthenticated, acl) {
  function createTransaction(req, res) {
    // Validate the inputs given to createTransaction
    if (!utils.validateTransactionInputs(req)) {
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
      return res.status(400).send('No user logged in');
    }

    // Check that the user is the same as from
    if (req.user._id != req.body.from.id) {
      return res.status(400).send('Incorrect user: ' + from.name + 'does not match ' + req.user.username);
    }

    var transaction = new Transaction({
      to          : to,
      from        : from,
      amount      : amount,
      category    : categoryName
    });

    var categoryPromise = Category.findByName(categoryName);
    var fromUserPromise = User.findById(from.id).exec();
    var toUserPromise = User.findById(to.id).exec();

    var toUserCategoryTotal;
    var toUser;
    var fromUser;
    var category;

    // Get the category
    categoryPromise
      .then(function(categoryP) {
        categoryP.repsLiquid = categoryP.repsLiquid - amount;
        categoryP.repsInvested = categoryP.repsInvested + amount;
        categoryP.reps = categoryP.repsLiquid + categoryP.repsInvested;
        category = categoryP;
        return toUserPromise;
      }, function(err) {
        return res.status(400).send(err);
      // Deal with the to user
      }).then(function(touser) {
        for (var i = 0; i < touser.categories.length; i++) {
          if (touser.categories[i].name === categoryName) {
              touser.categories[i].reps = touser.categories[i].reps + amount;
              toUserCategoryTotal = touser.categories[i].reps;
              categoryIndex = i;
            }
          }

          if (categoryIndex === -1) {
            return res.status(400).send('Unable to find corresponding category');
          }
          toUser = utils.addInvestorToExpertCategory(touser, from.id, from.name, categoryIndex);
          return fromUserPromise;
      }, function(err) {
        return res.status(400).send(err);
      // Deal with the from user
      }).then(function(fromUser) {
        portfolioIndex = utils.getPortfolioIndex(fromUser, categoryName);
        if (portfolioIndex === -1) {
          return res.status(400).send('Unable to find portfolioIndex');
        }
        var portfolio = utils.updateInvestorPortfolio(fromUser.portfolio,
          categoryName, to, amount, toUserCategoryTotal, investmentId);
        if (!portfolio) {
          return res.status(400).send('Error updating portfolio');
        }
        fromUser.portfolio = portfolio;
        transaction.save(function(err) {
          if (err) {
            return res.status(400).send(err);
          } else {
            toUser.save(function(err) {
              if (err) {
                Transaction.findOneAndRemove({'id': transaction.id});
                return res.status(400).send(err);
              } else {
                fromUser.save(function(err) {
                  if (err) {
                    Transaction.findOneAndRemove({'id': transaction.id});
                    toUser.categories[categoryIndex].reps -= amount;
                    toUser.save();
                    return res.status(400).send(err);
                  } else {
                    category.save(function(err) {
                      if (err) {
                        Transaction.findOneAndRemove({'id': transaction.id});
                        toUser.categories[categoryIndex].reps -= amount;
                        toUser.save();
                        fromUser.portfolio[portfolioIndex].reps += amount;
                        fromUser.save();
                        return res.status(400).send(err);
                      } else {
                        // Update the expert percentiles
                        utils.updateExpertPercentiles(category.name, function(err) {
                          if (err) {
                            Transaction.findOneAndRemove({'id': transaction.id});
                            toUser.categories[categoryIndex].reps -= amount;
                            toUser.save();
                            fromUser.portfolio[portfolioIndex].reps += amount;
                            fromUser.save();
                            category.repsLiquid += amount;
                            category.repsInvested -= amount;
                            categoryP.reps = categoryP.repsLiquid + categoryP.repsInvested;
                            category.save();
                            return res.status(400).send(err);
                          } else {
                            // Update the investor percentiles, valuations, and percentages
                            utils.updateInvestors(category.name, function(err) {
                              if (err) {
                                Transaction.findOneAndRemove({'id': transaction.id});
                                toUser.categories[categoryIndex].reps -= amount;
                                toUser.save();
                                fromUser.portfolio[portfolioIndex].reps += amount;
                                fromUser.save();
                                category.repsLiquid += amount;
                                category.repsInvested -= amount;
                                categoryP.reps = categoryP.repsLiquid + categoryP.repsInvested;
                                category.save();
                                return res.status(400).send(err);
                              } else {
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
          }
        });
      }, function(err) {
        return res.status(400).send(err);
      }).end();
  }

  router.route('/transactions')
    // Get all the transactions
    .get(isAuthenticated, function(req, res) {
      Transaction.find(function(err, transactions) {
        if (err) {
          return res.status(503).send(err);
        } else {
          return res.status(200).send(transactions);
        }
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
      Transaction.findById(req.params.transaction_id, function(err, transaction) {
        if (err) {
          return res.status(503).send(err);
        } else {
          return res.status(200).send(transaction);
        }
      });
    })

    // Update the transaction with this id
    .put(isAuthenticated, acl.isAdmin, function(req, res) {
      Transaction.findById(req.params.transaction_id, function(err, transaction) {
        if (err) {
          return res.status(503).send(err);
        } else {
          transaction.to          = req.body.to;
          transaction.from        = req.body.from;
          transaction.amount      = req.body.amount;
          transaction.category    = req.body.category;
          transaction.save(function(err) {
            if (err) {
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
          return res.status(503).send(err);
        } else {
          return res.status(200).send('Successfully deleted transaction');
        }
      });
   });

  router.route('/transactions/users/:user_id/all')
    // Get all of the transactions to or from a given user
    .get(isAuthenticated, function(req, res) {
      Transaction.findByUserIdAll(req.params.user_id).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        return res.status(503).send(err);
      });
    });

  router.route('/transactions/users/:user_id/all/public')
    // Get all of the public transactions to or from a given user
    .get(isAuthenticated, function(req, res) {
      Transaction.findByUserIdAllPublic(req.params.user_id).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        return res.status(503).send(err);
      });
    });


  // Get all of the transactions to a given user
  router.route('/transactions/users/:user_id/to/public')
    .get(isAuthenticated, function(req, res) {
      Transaction.findByUserIdTo(req.params.user_id).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        return res.status(503).send(err);
      });
    });

  // Get all of the transactions from a given user
  router.route('/transactions/users/:user_id/from')
    .get(isAuthenticated, function(req, res) {
      Transaction.findByUserIdFrom(req.params.user_id).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        return res.status(503).send(err);
      });
    });

  // Get all of the public transactions from a given user
  router.route('/transactions/users/:user_id/from/public')
    .get(isAuthenticated, function(req, res) {
      Transaction.findByUserIdFromPublic(req.params.user_id).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        return res.status(503).send(err);
      });
    });

  // Get all of the public transactions between users
  router.route('/transactions/users/:user_id/us/public')
    .get(isAuthenticated, function(req, res) {
      Transaction.findByUserIdUsPublic(req.params.user_id).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        return res.status(503).send(err);
      });
    });

  // Get all of the public transactions for a given category
  router.route('/transactions/categories/:categoryName')
    .get(isAuthenticated, function(req, res) {
      Transaction.findByCategory(req.params.categoryName).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        return res.status(503).send(err);
      });
    });
};
