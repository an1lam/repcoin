'use strict';

var mongoose = require('mongoose');
var Category = require('../models/Category.js');
var Notification = require('../models/Notification.js');
var Transaction = require('../models/Transaction.js');
var User = require('../models/User.js');
var utils = require('../routes/utils.js');
var winston = require('winston');

var TransactionHandler = {
  transactions: {
    category: {
      findMostRecent: function(req, res) {
        var timeStamp = req.params.timeStamp;
        var category = req.params.category;
        Transaction.findMostRecentByCategory(timeStamp, category).then(function(transactions) {
          return res.status(200).send(transactions);
        }, function(err) {
          winston.log('error', 'Error finding transactions: %s', err.toString());
          return res.status(503).send(err);
        });
      },
    },

    findMostRecent: function(req, res) {
      var timeStamp = req.params.timeStamp;
      Transaction.findMostRecent(timeStamp).then(function(transactions) {
        return res.status(200).send(transactions);
      }, function(err) {
        winston.log('error', 'Error finding transactions: %s', err.toString());
        return res.status(503).send(err);
      });
    },

    userId: {
      findMostRecent: function(req, res) {
        var timeStamp = req.params.timeStamp;
        var filter = req.params.filter;
        var userId = req.params.user_id;

        var query;
        switch(filter) {
          case 'all':
            query = Transaction.findMostRecentAllUser(timeStamp, userId);
            break;

          case 'to':
            query = Transaction.findMostRecentToUser(timeStamp, userId);
            break;

          case 'from':
            query = Transaction.findMostRecentFromUser(timeStamp, userId);
            break;

          case 'us':
            query = Transaction.findMostRecentBetweenUsers(timeStamp, userId, req.session.passport.user);
            break;

          default:
            query = Transaction.findMostRecentAllUser(timeStamp, userId);
            break;
        }

        query.then(function(transactions) {
          return res.status(200).send(transactions);
        }, function(err) {
          winston.log('error', 'Error finding transactions: %s', err.toString());
          return res.status(503).send(err);
        });
      },
    },

    total: {
      get: function(req, res) {
        Transaction.getTotalRepsTraded().then(function(result) {
          var total = Math.floor(result[0].total);
          if (isNaN(total)) {
            return res.status(501).send('Error retrieving total reps traded');
          }
          return res.status(200).send({ total: total});
        }, function(err) {
          winston.log('error', 'Error getting total reps traded: %s', err.toString());
          return res.status(501).send(err);
        });
      },
    },

    post: function(req, res) {
      if (!utils.validateTransactionInputs(req)) {
        winston.log('info', 'Invalid transaction inputs');
        return res.status(412).send('Invalid transaction inputs');
      }
      var from, to, amount, categoryName, category, investmentId, transaction,
        fromUserPromise, toUserPromise, categoryPromise, transactionPromise,
        fromUser, toUser, toUserSave, fromUserSave, categorySave, toUserObj, fromUserObj, categoryObj;

      from = req.body.from;
      to = req.body.to;
      amount = Number(req.body.amount);
      categoryName = req.body.category;
      investmentId = req.body.id;

      // Create all of the promises that are needed to make a transaction
      transactionPromise = Transaction.create({
        to          : to,
        from        : from,
        amount      : Math.floor(amount * 100)/100,
        category    : categoryName
      });
      fromUserPromise = User.findById(from.id).exec();
      toUserPromise = User.findById(to.id).exec();
      categoryPromise = Category.findByName(categoryName);

      // The callback for failure on any promise error
      var cbF = function(err) {
        winston.log('error', 'Error creating transaction: %s', err.toString());
        throw err;
      };

      try {
        var promise = transactionPromise.then(function(transactionP) {
          transaction = transactionP;
          return toUserPromise;
        }, cbF).then(function(touser) {
          toUser = touser;
          return fromUserPromise;
        }, cbF).then(function(fromuser) {
          fromUser = fromuser;
          return categoryPromise;
        }, cbF).then(function(categoryP) {
          category = categoryP;

          // Update fields for all of the documents as they should be for the transaction
          var err = utils.processTransaction(toUser, fromUser, category, transaction, investmentId);
          if (err) {
            cbF(err);
          }

          // Save all of the users in updates
          toUserObj = toUser.toObject();
          delete toUserObj._id;
          fromUserObj = fromUser.toObject();
          delete fromUserObj._id;
          categoryObj = category.toObject();
          delete categoryObj._id;

          toUserSave = User.findOneAndUpdate({ _id: mongoose.Types.ObjectId(toUser._id) }, toUserObj).exec();
          fromUserSave = User.findOneAndUpdate({ _id: mongoose.Types.ObjectId(fromUser._id) }, fromUserObj).exec();
          categorySave = Category.findOneAndUpdate({ _id: mongoose.Types.ObjectId(category._id) }, categoryObj).exec();
          var savePromise = toUserSave.then(function(toUser) {
            return fromUserSave;
          }, cbF).then(function(fromUser) {
            return categorySave;
          }, cbF).then(function(category) {
            utils.updateDividends(toUser, category.name, function(err) {
              if (err) {
                winston.log('error', 'Error updating dividends: %s', err.toString());
                throw err;
              }
              utils.updateAllRank(category.name, function(err) {
                if (err) {
                  winston.log('error', 'Error updating rank: %s', err.toString());
                  throw err;
                }

                // Notify the to user of the transaction
                var action;
                if (amount < 0) {
                  action = ' revoked ' + amount * -1 + ' reps from you for ' + transaction.category;
                } else {
                  action = ' gave ' + amount + ' reps to you for ' + transaction.category;
                }
                var fromText = transaction.from.anonymous ? 'Someone' : transaction.from.name;
                Notification.create({
                  user    : { id: transaction.to.id, name: transaction.to.name },
                  message : fromText + action,
                });
                return res.status(200).send(transaction);
              });
            });
          }, cbF);
        }, cbF);
      }
      catch(err) {
        return res.status(503).send(err);
      }
    },
  },
};

module.exports = TransactionHandler;
