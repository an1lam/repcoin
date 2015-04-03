'use strict';
var Transaction = require('../models/Transaction.js');
var TransactionHandler = require('../handlers/transaction.js');
var winston = require('winston');

// Routes that end in /transactions
module.exports = function(router, isAuthenticated, acl) {
  router.post('/transactions', isAuthenticated, acl.isAdminOrFrom, TransactionHandler.transactions.post);

  // Get the total reps traded on Repcoin so far
  router.get('/transactions/totaltraded', TransactionHandler.transactions.total.get);

  // Get most recent transactios by general, category, or userId
  router.get('/transactions/:timeStamp',
    TransactionHandler.transactions.findMostRecent);
  router.get('/transactions/categories/:category/:timeStamp',
    TransactionHandler.transactions.category.findMostRecent);
  router.get('/transactions/users/:user_id/:filter/public/:timeStamp',
    TransactionHandler.transactions.userId.findMostRecent);

///////// Routes that have /transcations/:transaction_id ////////
  router.route('/transactions/:transaction_id')

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
};
