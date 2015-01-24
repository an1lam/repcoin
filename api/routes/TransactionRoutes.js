'use strict';
var Category = require('../models/Category.js');
var Notification = require('../models/Notification.js');
var Transaction = require('../models/Transaction.js');
var TransactionHandler = require('../handlers/transaction.js');
var User = require('../models/User.js');
var utils = require('./utils.js');
var winston = require('winston');

// Routes that end in /transactions
module.exports = function(router, isAuthenticated, acl) {
  router.post('/transactions', isAuthenticated, acl.isAdminOrFrom, TransactionHandler.transactions.post);

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
