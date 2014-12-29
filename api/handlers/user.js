'use strict';
var winston = require('winston');
var User = require('../models/User.js');
var utils = require('../routes/utils.js');

var UserHandler = {
  // Routes with the url /users
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
    },

    // Route /users/list/byids/
    listByIds: {
      get: function(req, res) {
        winston.log('info', 'GET /users/list/byids');
        if (!req.query.idList) {
          winston.log('info', 'No id list provided');
          return res.status(412).send('No id list provided');
        }
        User.findPublic({ '_id': { $in: req.query.idList }}, function(err, users) {
          if (err) {
            winston.log('error', 'Error finding users: %s', err);
            return res.status(501).send(err);
          } else {
            winston.log('info', 'Found users');
            return res.status(200).send(users);
          }
        });
      }
    },

    // Routes with /users/user_id
    userId: {
      get: function(req, res) {
        winston.log('info', 'GET /users/%s', req.params.user_id);
        var cb = function(err, user) {
          if (err) {
            winston.log('error', 'Error getting user: %s', err);
            return res.status(501).send(err);
          } else if (!user) {
            winston.log('info', 'No user found with id: %s', req.params.user_id);
            return res.status(501).send('No user was found');
          } else {
            winston.log('info', 'Found user with id: %s', req.params.user_id);
            return res.status(200).send(user);
          }
        };

        // TODO: flesh out acl to work not just as middleware to avoid repetition
        // Return all fields if the user requested is the requesting
        if (req.params.user_id === req.session.passport.user) {
          User.findById(req.params.user_id, cb);
        } else {
          // Otherwise, return only public information
          User.findByIdPublic(req.params.user_id, cb);
        }
      },

      delete: function(req, res) {
        var userId = req.params.user_id;
        winston.log('info', 'DELETE /users/%s', userId);
        User.remove({ _id: userId }, function(err, user) {
          if (err) {
            winston.log('error', 'Error finding user: %s', err);
            return res.status(501).send(err);
          } else if (!user) {
            winston.log('info', 'No user found with id: %s', userId);
            return res.status(501).send('No user was found with id: ' + userId);
          } else {
            winston.log('info', 'Found user with id: %s', userId);
            return res.status(200).send(user);
          }
        });
      }
    },

    // /users/:categoryName/leaders/:count
    leaders: {
      get: function(req, res) {
        winston.log('info', 'GET /users/%s/leaders/%s', req.params.categoryName, req.params.count);
        if (!utils.validateLeadersCountInputs(req)) {
          winston.log('info', 'Invalid inputs');
          return res.status(412).send('Invalid inputs');
        }

        var categoryName = req.params.categoryName;
        var count = req.params.count;
        var expert = req.query.expert === '1';

        User.findNLeadersPublic(categoryName, parseInt(count), expert, function(err, leaders) {
          if (err) {
            winston.log('error', 'Error finding users: %s', err);
            return res.status(501).send(err);
          } else {
            // sort the users in decreasing order of directScore
            var percentileComparator = utils.getPercentileComparator(categoryName, expert);
            winston.log('info', 'Found %s leaders for category %s', count, categoryName);
            return res.status(200).send(leaders.sort(percentileComparator));
          }
        });
      }
    }
  }
};

module.exports = UserHandler;
