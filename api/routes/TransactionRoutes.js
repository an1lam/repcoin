// api/routes/TransactionRoutes.js

var Category = require('../models/Category.js');
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
        // Find the portfolio entry that should be updated
        var indexI = -1;
        var indexJ = -1;
        var portfolio = fromUser.portfolio;
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
        
        // The from user is not an investor for this category (ERROR!)
        if (indexI === -1) {
          res.status(400).send("Invalid transaction");
          return;
        }
        // The from user has never invested in this user before
        if (indexJ === -1) {
          var investment = { user       : req.body.to.name,
                             amount     : amount,
                             valuation  : amount,
                             percentage : Number(amount/toUserCategoryTotal * 100) };
          portfolio[indexI].investments.push(investment);
        } else {
          // Update the existing investment
          portfolio[indexI].investments[indexJ].amount += amount;
          portfolio[indexI].investments[indexJ].percentage =
            Number(portfolio[indexI].investments[indexJ].amount/toUserCategoryTotal * 100)
          var valuation = portfolio[indexI].investments[indexJ].percentage/100 * toUserCategoryTotal;
          portfolio[indexI].investments[indexJ].valuation = Math.floor(valuation);
        }

        // Update the portfolio entry for that category
        portfolio[indexI].repsAvailable -= amount;
        fromUser.portfolio = portfolio;
 
        transaction.save();
        toUser.save();
        fromUser.save();
        category.save();
        res.send(transaction);
        return;
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
