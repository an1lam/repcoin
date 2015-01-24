'use strict';

var Category = require('../models/Category.js');
var Notification = require('../models/Notification.js');
var Transaction = require('../models/Transaction.js');
var User = require('../models/User.js');
var utils = require('../routes/utils.js');
var winston = require('winston');

var TransactionHandler = {
  transactions: {
    post: function(req, res) {
      if (!utils.validateTransactionInputs(req)) {
        winston.log('info', 'Invalid transaction inputs');
        return res.status(412).send('Invalid transaction inputs');
      }
      var from, to, amount, categoryName, category, investmentId, transaction,
        fromUserPromise, toUserPromise, categoryPromise,
        fromUser, toUser, toUserReps;

      from = req.body.from;
      to = req.body.to;
      amount = Number(req.body.amount);
      categoryName = req.body.category;
      investmentId = req.body.id;
      transaction = new Transaction({
        to          : to,
        from        : from,
        amount      : amount,
        category    : categoryName
      });

      fromUserPromise = User.findById(from.id).exec();
      toUserPromise = User.findById(to.id).exec();
      categoryPromise = Category.findByName(categoryName);

      // Get all of the docs that will be updated
      toUserPromise.then(function(touser) {
        toUser = touser;
        return fromUserPromise;
       }, function(err) {
        winston.log('error', 'Error creating transaction: %s', err.toString());
        return res.status(400).send(err);
      }).then(function(fromuser) {
        fromUser = fromuser;
        return categoryPromise;
      }, function(err) {
        winston.log('error', 'Error creating transaction: %s', err.toString());
        return res.status(400).send(err);
      }).then(function(categoryP) {
        category = categoryP;
        // Update fields for all of the documents a they should be for the transaction
        var err = utils.processTransaction(toUser, fromUser, category, transaction, investmentId);
        if (err) {
          winston.log('error', err);
          return res.status(400).send('Error updating portfolio');
        }
        // Save all of the documents
        var docs = [toUser, fromUser, category, transaction];
        utils.saveAll(docs, function(errs) {
          if (errs.length > 0) {
            winston.log('error', 'Error saving transaction: %s', err.toString());
            return res.status(400).send(err);
          }
          utils.updatePercentilesAndDividends(category.name, toUser, function(err) {
            if (err) {
              winston.log('error', 'Error updating percentiles: %s', err.toString());
              return res.status(400).send(err);
            }

            // Notify the to user of the transaction
            var action;
            if (amount < 0) {
              action = ' revoked ' + amount * -1 + ' reps from you for ' + transaction.category;
            } else {
              action = ' gave ' + amount + ' reps to you for ' + transaction.category;
            }
            var fromText = transaction.anonymous ? 'Someone' : transaction.from.name;
            var notification = new Notification({
              user    : { id: transaction.to.id, name: transaction.to.name },
              message : fromText + action,
            });
            notification.save();

            return res.status(200).send(transaction);
          });
        });
      }, function(err) {
        winston.log('error', 'Error creating transaction: %s', err.toString());
        return res.status(400).send(err);
      });

    },
  },
};

module.exports = TransactionHandler;
