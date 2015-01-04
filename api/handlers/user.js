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

      put: function(req, res) {
        var userId = req.params.user_id;
        winston.log('info', 'PUT /users/%s', userId);
        if (!utils.validateUserInputs(req)) {
          winston.log('info', 'Invalid inputs');
          return res.status(412).send('Invalid inputs');
        }

        User.findById(userId, function(err, user) {
          if (err) {
            winston.log('error', 'Error finding user: %s', err);
            return res.status(501).send(err);
          } else if (!user) {
            winston.log('info', 'No user found with id: %s', userId);
            return res.status(501).send('No user found with id: ' + userId);
          } else {
            user.about            = req.body.about || user.about;
            user.username         = req.body.username || user.username;
            user.defaultCategory  = req.body.defaultCategory || user.defaultCategory;
            user.picture          = req.body.picture || user.picture;

            if (req.body.links) {
              if (!utils.validateUserLinks(req.body.links)) {
                winston.log('info', 'Invalid link inputs: %s', req.body.links);
                return res.status(412).send('Invalid link inputs');
              }
              if (req.body.links[0] == 'EMPTY') {
                user.links = [];
              } else {
                user.links = req.body.links;
              }
            }

            user.save(function(err, user) {
              if (err) {
                winston.log('error', 'Error saving user: %s', err);
                return res.status(501).send(err);
              } else {
                winston.log('info', 'Saved user with id: %s', userId);
                return res.status(200).send(user);
              }
            });
          }
        });
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
      },

      investorCategory: {
        delete: function(req, res) {
          var userId = req.params.user_id;
          var categoryName = req.params.category_name;
          winston.log('info', 'PUT /users/%s/%s/investor/delete', userId, categoryName);
          User.findById(userId, function(err, user) {
            if (err) {
              winston.log('error', 'Error finding user: %s', err);
              return res.status(501).send(err);
            } else if (!user) {
              winston.log('info', 'No user found with id: %s', userId);
              return res.status(501).send('No user found with id: ' + userId);
            // If the user is not investor for the category, just return the user
            } else if (!utils.isInvestor(user, categoryName)) {
              winston.log('info', 'User %s is already an investor for %s', userId, categoryName);
              return res.status(200).send(user);
            } else {
              // Update all of the experts invested in by this user for the category
              var expertIds = utils.getInvestorsExperts(user, categoryName);
              utils.updateInvestorsExperts(expertIds, categoryName, user._id, function(err) {
                if (err) {
                  winston.log('error', 'Error updating investors\' experts: %s', err);
                  return res.status(501).send(err);
                } else {
                  user = utils.deleteInvestorCategory(user, categoryName);
                  user.save(function(err, user) {
                    if (err) {
                      winston.log('error', 'Error saving user: %s', err);
                      return res.status(501).send(err);
                    } else {
                      winston.log('info', 'Saved user: %s', userId);
                      return res.status(200).send(user);
                    }
                  });
                }
              });
            }
          });
        },
      },

      expertCategory: {
        delete: function(req, res) {
          var categoryName = req.params.category_name;
          var userId = req.params.user_id;
          winston.log('info', 'PUT /users/%s/%s/expert/delete', userId, categoryName);
          User.findById(userId, function(err, user) {
            if (err) {
              winston.log('error', 'Error finding user: %s', err);
              return res.status(501).send(err);
            } else if (!user) {
              winston.log('info', 'No user found with id: %s', userId);
              return res.status(501).send('No user found with id: ' + userId);
            // If the user is not an expert for this category, just return the user
            } else if (!utils.isExpert(user, categoryName)) {
              winston.log('info', 'User %s is not an expert for %s', userId, categoryName);
              return res.status(200).send(user);
            } else {
              // Reimburse the user's investors in the category
              var investors = utils.getInvestors(user, categoryName);
              utils.reimburseInvestors(investors, categoryName, user._id, function(err) {
                if (err) {
                  winston.log('error', 'Error reimbursing investors: %s', err);
                  return res.status(501).send(err);
                } else {
                  user = utils.deleteExpertCategory(user, categoryName);
                  user.save(function(err, user) {
                    if (err) {
                      winston.log('error', 'Error saving user: %s', err);
                      return res.status(501).send(err);
                    } else {
                      winston.log('info', 'Saved user: %s', userId);
                      return res.status(200).send(user);
                    }
                  });
                }
              });
            }
          });
        }
      },
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
    },
  }
};

module.exports = UserHandler;
