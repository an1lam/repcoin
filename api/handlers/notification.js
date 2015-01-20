'use strict';
var Notification = require('../models/Notification.js');
var winston = require('winston');

var NotificationHandler = {
  user: {
    userId: {
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
