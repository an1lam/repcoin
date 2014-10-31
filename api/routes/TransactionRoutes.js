// api/routes/TransactionRoutes.js

var Transaction = require('../models/Transaction.js');
var User = require('../models/User.js');

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

    transaction.save( function(err) {
      if (err) {
        res.status(400).send(err);
      } else {
        // Deal with from user
        User.findById(req.body.from.id, function(err, user) {
          if (err) {
            Transaction.findOneAndRemove({ "id": transaction.id });
            res.send(err);
          } else {
            var fromUser = user;
        
            // Find the category that should be updated
            var categoryToUpdate = null;
            for (var i = 0; i < user.categories.length; i++) {
              if (user.categories[i].name === req.body.category) {
                categoryToUpdate = user.categories[i];
              }
            }
 
            // Find the portfolio entry that should be updated
            var indexI = -1;
            var indexJ = -1;
            var portfolio = user.portfolio;
            for (var i = 0; i < portfolio.length; i++) {
              if (portfolio[i].category === req.body.category) {
                var investments = portfolio[i].investments;
                indexI = i;
                for (var j = 0; j < investments.length; j++) {
                  if (investments[j].user === req.body.to.name) {
                    indexJ = j;
                  }
                }
              }
            }
            
            // The user is not an investor for this category (ERROR!)
            if (indexI === -1) {
              res.status(400).send("Invalid transaction");
            }

            // The user has never invested in this user before
            if (indexJ === -1) {
              var investment = { user       : req.body.to.name,
                                 amount     : req.body.amount,  
                                 valuation  : req.body.amount }; 
              portfolio[indexI].investments.push(investment);
            } else {
             portfolio[indexI].investments[indexJ].amount += req.body.amount; 
            }

            if (categoryToUpdate !== null) {
              categoryToUpdate.reps -= req.body.amount;
              user.save(function(err) {
                if (err) {
                  Transaction.findOneAndRemove({ "id": transaction.id });
                  res.send(err);
                } else {
                  // Deal with to user.
                  User.findById(req.body.to.id, function(err, user) {
                    if (err) {
                      Transaction.findOneAndRemove({'id': transaction.id});
                      fromUser.reps += amount;
                      fromUser.save();
                      res.send(err);
                    } else {
                      var categoryToUpdate = null;
                      for (var i = 0; i < user.categories.length; i++) {
                        if (user.categories[i].name === req.body.category) {
                          categoryToUpdate = user.categories[i];
                        }
                      }

                      if (categoryToUpdate !== null) {
                        categoryToUpdate.directScore = parseInt(categoryToUpdate.directScore) + parseInt(req.body.amount);
                        user.save(function(err) {
                          if (err) {
                            Transaction.findOneAndRemove({'id': transaction.id});
                            fromUser.reps += amount;
                            fromUser.save();
                            res.send(err)
                          } else {
                            res.send(transaction);
                          }
                        });
                      } else {
                        res.send("Unable to find corresponding category");
                      }
                    }
                  });
                }
              });
            } else {
              res.send("Unable to find corresponding category");
            }
          }
        });
      }
    });
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
      Transaction.findByUserIdAll(req.params.userId, function(err, transactions) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(transactions);
        }
      });
    });

  router.route('/transactions/users/:userId/all/public')
    // Get all of the public transactions to or from a given user
    .get(function(req, res) {
      Transaction.findByUserIdAllPublic(req.params.userId, function(err, transactions) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(transactions);
        }
      });
    });


  // Get all of the transactions to a given user
  router.route('/transactions/users/:userId/to/public')
    .get(function(req, res) {
      Transaction.findByUserIdTo(req.params.userId, function(err, transactions) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(transactions);
        }
      });
    });

  // Get all of the transactions from a given user
  router.route('/transactions/users/:userId/from')
    .get(function(req, res) {
      Transaction.findByUserIdFrom(req.params.userId, function(err, transactions) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(transactions);
        }
      });
    });

  // Get all of the public transactions from a given user
  router.route('/transactions/users/:userId/from/public')
    .get(function(req, res) {
      Transaction.findByUserIdFromPublic(req.params.userId, function(err, transactions) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(transactions);
        }
      });
    });

  // Get all of the public transactions between users
  router.route('/transactions/users/:userId/us/public')
    .get(function(req, res) {
      Transaction.findByUserIdUsPublic(req.params.userId, req.user._id, function(err, transactions) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(transactions);
        }
      });
    });

  // Get all of the public transactions for a given category
  router.route('/transactions/categories/:categoryName')
    .get(function(req, res) {
      Transaction.findByCategory(req.params.categoryName, function(err, transactions) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(transactions);
        }
      });
    });
};
