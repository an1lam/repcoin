'use strict';
var Notification = require('../models/Notification.js');
var utils = require('../routes/utils.js');
var winston = require('winston');

var NotificationHandler = {
  user: {
    userId: {
      markread: {
        put: function(req, res) {
          winston.log('info', 'PUT /notifications/user/%s/markread', req.params.user_id);
          var notificationIds = req.body.notificationIds;
          if (!notificationIds) {
            return res.status(412).send('Invalid inputs');
          }
          Notification.find({ '_id': { $in: notificationIds }}).exec().then(function(notifications) {
            for (var i = 0; i < notifications.length; i++) {
              notifications[i].viewed = true;
            }
            utils.saveAll(notifications, function(errs) {
              if (errs.length > 0) {
                winston.log('error', 'Error marking notifications read: %s', errs.toString());
                return res.status(503).send(errs);
              } else {
                return res.status(200).send('Successfully marked notifications read');
              }
            });
          }, function(err) {
            winston.log('error', 'Error updating notifications: %s', err.toString());
            return res.status(503).send(err);
          });
        },
      },

      unread: {
        get: function(req, res) {
          var userId = req.params.user_id;
          winston.log('info', 'GET /notifications/user/%s/unread', userId);
          Notification.findUnread(userId).then(function(notifications) {
            return res.status(200).send(notifications);
          }, function(err) {
            winston.log('error', 'Error finding unread notifications: %s', err.toString());
            return res.status(503).send(err);
          });
        },
      },
    },
  },
};

module.exports = NotificationHandler;
