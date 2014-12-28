'use strict';
var winston = require('winston');
var User = require('../models/User.js');

var UserHandler = {
  users: {
    get: function(req, res) {
      winston.log('info', 'GET /users');
      // Check if we want to get the users with a search term
      if (req.query.searchTerm) {
        winston.log('info', 'Finding users with searchTerm %s', req.query.searchTerm);
        User.findBySearchTermPublic(req.query.searchTerm, function(err, users) {
          if (err) {
            winston.log('error', 'Error finding users: %s', err);
            return res.status(501).send(err);
          } else {
            winston.log('info', 'Found users');
            return res.status(200).send(users);
          }
        });
      }

      // Get the users normally
      else {
        User.findPublic({}, function(err, users) {
          if (err) {
            winston.log('error', 'Error finding users: %s', err);
            return res.status(501).send(err);
          } else {
            winston.log('info', 'Found users');
            return res.status(200).send(users);
          }
        });
      }
    }
  }
};

module.exports = UserHandler;
