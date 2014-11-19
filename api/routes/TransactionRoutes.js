"use strict";
var Category = require('../models/Category.js');
var Transaction = require('../models/Transaction.js');
var User = require('../models/User.js');
var utils = require('./utils.js');

// Routes that end in /transactions
// TODO : ADD AUTHENTICATION INTO EACH ROUTE!!
module.exports = function(router, isAuthenticated) {

  function createTransaction(req, res) {
    // Check that there is a user logged in
    if (!req.user) {
      res.status(400).send("No user logged in");
      return;
    }

    // Check that the user is the same as from
    if (req.user._id != req.body.from.id) {
      res.status(400).send("Incorrect user: " + req.body.from.name + "does not match " + req.user.username);
      return;
    }

    var transaction = new Transaction({
      to          : req.body.to,
      from        : req.body.from,
      amount      : req.body.amount,
      category    : req.body.category
    });

    var categoryPromise = Category.findByName(req.body.category);
    var fromUserPromise = User.findById(req.body.from.id).exec();
    var toUserPromise = User.findById(req.body.to.id).exec();
    var amount = Number(req.body.amount);

    var toUserCategoryTotal;
    var toUser;
    var fromUser;
    var category;

    // Get the category
    categoryPromise
      .then(function(categoryP) {
        categoryP.repsLiquid = categoryP.repsLiquid - amount;
        categoryP.repsInvested = categoryP.repsInvested + amount;
        category = categoryP;
        return toUserPromise;
      }, function(err) {
        res.status(400).send(err);
        return;

      // Deal with the to user
      }).then(function(touser) {
        var updated = false;
        for (var i = 0; i < touser.categories.length; i++) {
          if (touser.categories[i].name === req.body.category) {
              touser.categories[i].reps = touser.categories[i].reps + amount;
              toUserCategoryTotal = touser.categories[i].reps;
              updated = true;
            }
          }

          if (!updated) {
            res.status(400).send("Unable to find corresponding category");
            return;
          }
          toUser = touser;
          return fromUserPromise;
      }, function(err) {
        res.status(400).send(err);
        return;

      // Deal with the from user
      }).then(function(fromUser) {
        var portfolio = utils.updateInvestorPortfolio(fromUser.portfolio,
          req.body.category, req.body.to, amount, toUserCategoryTotal);
        if (!portfolio) {
          res.status(400).send("Invalid transaction");
          return;   
        }
        fromUser.portfolio = portfolio;
        transaction.save(function(err) {
          if (err) {
            res.status(400).send(err);
          } else {
            toUser.save(function(err) {
              if (err) {
                Transaction.findOneAndRemove({'id': transaction.id});
                res.status(400).send(err);
              } else {
                fromUser.save(function(err) {
                  if (err) {
                    Transaction.findOneAndRemove({'id': transaction.id});
                    toUser.reps -= amount;
                    toUser.save();
                    res.status(400).send(err);
                  } else {
                    category.save(function(err) {
                      if (err) {
                        Transaction.findOneAndRemove({'id': transaction.id});
                        toUser.reps -= amount;
                        toUser.save();
                        fromUser.portfolio[indexI].repsAvailable += amount;
                        fromUser.save();
                        res.status(400).send(err);
                      } else {
                        // Update the expert percentiles
                        utils.updateExpertPercentiles(category.name, function(err) {
                          if (err) {
                            Transaction.findOneAndRemove({'id': transaction.id});
                            toUser.reps -= amount;
                            toUser.save();
                            fromUser.portfolio[indexI].repsAvailable += amount;
                            fromUser.save();
                            category.repsLiquid += amount;
                            category.repsInvested -= amount;
                            category.save();
                            res.status(400).send(err);
                          } else {
                            // Update the investor percentiles
                            utils.updateInvestorPercentiles(category.name, function(err) {
                              if (err) {
                                Transaction.findOneAndRemove({'id': transaction.id});
                                toUser.reps -= amount;
                                toUser.save();
                                fromUser.portfolio[indexI].repsAvailable += amount;
                                fromUser.save();
                                category.repsLiquid += amount;
                                category.repsInvested -= amount;
                                category.save();
                                res.status(400).send(err);
                              } else {
                                res.send(transaction);
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
          }
        });
      }, function(err) {
        res.status(400).send(err);
        return;
      }).end();
  }

  router.route('/transactions')
    // Get all the transactions
    .get(function(req, res) {
      Transaction.find(function(err, transactions) {
        if (err) {
          res.send(err);
        } else {
          res.json(transactions);
        }
      });
    })

    // Create a new transaction
    .post(function(req, res) {
      createTransaction(req, res);
    });

///////// Routes that have /transcations/:transaction_id ////////
  router.route('/transactions/:transaction_id')
    // Get the transaction with this id
    .get(function(req, res) {
      Transaction.findById(req.params.transaction_id, function(err, transaction) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(transaction);
        }
      });
    })

    // Update the transaction with this id
    .put( function(req, res) {
      Transaction.findById(req.params.transaction_id, function(err, transaction) {
        if (err) {
          res.status(400).send(err);
        } else {
          transaction.to          = req.body.to;
          transaction.from        = req.body.from;
          transaction.amount      = req.body.amount;
          transaction.category    = req.body.category;
          transaction.save(function(err) {
            if (err) {
              res.status(400).send(err);
            } else {
              res.send(transaction);
            }
          });
        }
      });
    })

   // Delete the transaction with this id
   .delete(function(req, res) {
      // Remove the transaction
      Transaction.remove({ _id: req.params.transaction_id }, function(err, transaction) {
        if (err) {
          res.send(err);
        } else {
          res.send('Successfully deleted transaction');
        }
      });
   });

  router.route('/transactions/users/:userId/all')
    // Get all of the transactions to or from a given user
    .get(function(req, res) {
      Transaction.findByUserIdAll(req.params.userId).then(function(transactions) {
        res.send(transactions);
      }, function(err) {
        res.status(501).send(err);
      });
    });

  router.route('/transactions/users/:userId/all/public')
    // Get all of the public transactions to or from a given user
    .get(function(req, res) {
      Transaction.findByUserIdAllPublic(req.params.userId).then(function(transactions) {
        res.send(transactions);
      }, function(err) {
        res.status(501).send(err);
      });
    });


  // Get all of the transactions to a given user
  router.route('/transactions/users/:userId/to/public')
    .get(function(req, res) {
      Transaction.findByUserIdTo(req.params.userId).then(function(transactions) {
        res.send(transactions);
      }, function(err) {
        res.status(501).send(err);
      });
    });

  // Get all of the transactions from a given user
  router.route('/transactions/users/:userId/from')
    .get(function(req, res) {
      Transaction.findByUserIdFrom(req.params.userId).then(function(transactions) {
        res.send(transactions);
      }, function(err) {
        res.status(501).send(err);
      });
    });

  // Get all of the public transactions from a given user
  router.route('/transactions/users/:userId/from/public')
    .get(function(req, res) {
      Transaction.findByUserIdFromPublic(req.params.userId).then(function(transactions) {
        res.send(transactions);
      }, function(err) {
        res.status(501).send(err);
      });
    });

  // Get all of the public transactions between users
  router.route('/transactions/users/:userId/us/public')
    .get(function(req, res) {
      Transaction.findByUserIdUsPublic(req.params.userId).then(function(transactions) {
        res.send(transactions);
      }, function(err) {
        res.status(501).send(err);
      });
    });

  // Get all of the public transactions for a given category
  router.route('/transactions/categories/:categoryName')
    .get(function(req, res) {
      Transaction.findByCategory(req.params.categoryName).then(function(transactions) {
        res.send(transactions);
      }, function(err) {
        res.status(501).send(err);
      });
    });
};
