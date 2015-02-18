'use strict';

var crypto = require('crypto');
var winston = require('winston');

var Category = require('../models/Category.js');
var Notification = require('../models/Notification.js');
var Transaction = require('../models/Transaction.js');
var urlConfig = require('../../config/url.js');
var User = require('../models/User.js');
var utils = require('../routes/utils.js');
var VerificationToken = require('../models/VerificationToken.js');

var UserHandler = {
  // Route that verifies email
  verify: {
    post: function(req, res) {
      var token = req.body.verificationToken;

      if (!token) {
        winston.log('info', 'No verification token provided');
        return res.status(412).send('No verification token provided');
      }
      VerificationToken.findOne({ 'string': token }, function(err, verificationToken) {
        if (err) {
          winston.log('error', 'Error finding verification token: %s', err);
          return res.status(501).send(err);
        } else if (!verificationToken) {
          winston.log('info', 'No verification token found');
          return res.status(501).send('No verification token found');
        } else if (verificationToken.triggered) {
          winston.log('info', 'Verification token was already triggered');
          var msg = 'Verification token has already been used. Please return to the home page and log in.';
          return res.status(501).send(msg);
        }
        verificationToken.triggered = true;

        User.findOneAndUpdate(
          { 'email': verificationToken.user }, { 'verified': true },
          function(err, user) {
            if (err) {
              winston.log('error', 'Error updating user: %s', err.toString());
              return res.status(501).send(err);
            }

            verificationToken.save();

            // Create a welcome notification
            var notification = new Notification({
              user    : { id: user._id, name: user.username },
              message : 'Welcome to Repcoin! Go to your categories table and start adding categories!',
            });
            notification.save();

            // Create a join event
            utils.createEvent('join', [user.username, user._id]);

            req.login(user, function(err) {
              if (err) {
                winston.log('error', 'Error logging in user: %s', err.toString());
                return res.status(501).send(err);
              } else {
                return res.status(200).send(user);
              }
            });
          }
        );
      });
    },
  },

  // Routes with the url /users
  users: {
    get: function(req, res) {
      // Check if we want to get the users with a search term
      if (req.query.searchTerm) {
        User.findBySearchTermPublic(req.query.searchTerm, function(err, users) {
          if (err) {
            winston.log('error', 'Error finding users: %s', err);
            return res.status(501).send(err);
          } else {
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
            return res.status(200).send(users);
          }
        });
      }
    },

    share: {
      get: function(req, res) {
        if (!req.user || !req.user._id) {
          winston.log('error', 'User not authenticated');
          return res.status(412).send('Not authenticated');
        } else {
          var toHash = req.user._id + process.env.REPCOIN_EMAIL_PWD;
          var hashed = crypto.createHash("md5").update(toHash)
                             .digest('hex');
          var fullUrl = urlConfig[process.env.NODE_ENV] +
            '#/login/' + req.user._id + '/' + hashed;
          res.status(200).send(fullUrl);
        }
      },


      post: function(req, res) {
        if (!req.body.id || !req.body.hash) {
          return res.status(412).send("No id or hash given.")
        } else {
          var toHash = req.body.id + process.env.REPCOIN_EMAIL_PWD;
          var hashedID = crypto.createHash("md5")
            .update(toHash)
            .digest('hex');

          if (hashedID === req.body.hash) {
            User.update({_id: req.body.id}, {$inc: {reps: 5}},
              function(err, numAffected) {
                if (err) {
                  winston.log('error', 'Failed to update user with id ' +
                    req.body.id)
                  return res.status(501).send("Failed to update user");
                }

                return res.status(200).send('Success: ' +
                   req.body.id + '\'s ' + 'profile updated!')
              })
          }

        }
      }
    },

    // Route /users/list/byids/
    listByIds: {
      get: function(req, res) {
        if (!req.query.idList) {
          return res.status(412).send('No id list provided');
        }
        User.findPublic({ '_id': { $in: req.query.idList }}, function(err, users) {
          if (err) {
            winston.log('error', 'Error finding users: %s', err);
            return res.status(501).send(err);
          } else {
            return res.status(200).send(users);
          }
        });
      }
    },

    trending: {
      experts: {
        get: function(req, res) {
          var date = req.params.date;
          var category = req.params.category;
          Transaction.findTrendingExperts(date, category).then(function(userIds) {
            var idArray = [];
            for (var i = 0; i < userIds.length; i++) {
              idArray.push(userIds[i]._id);
            }
            User.findPublic({ '_id': { $in: idArray }, "categories.name": category }, function(err, users) {
              if (err) {
                winston.log('error', 'Error finding trending experts %s', err.toString());
                return res.status(501).send(err);
              } else {
                return res.status(200).send(users.slice(0,10));
              }
            });
          }, function(err) {
            winston.log('error', 'Error finding trending experts: %s', err.toString());
            return res.status(503).send(err);
          });
        },
      },
    },

    // Routes with /users/user_id
    userId: {
      // Nudge a user to become an expert in more categories
      // /users/user_id/nudge/user_id2
      nudge: {
        post: function(req, res) {
          var nudgeUserId = req.params.user_id;
          var receiverId = req.params.user_id2;
          var asker;
          try {
            User.findById(nudgeUserId).exec().then(function(askerr) {
              if (!askerr) {
                throw new Error('No asker found');
              }
              asker = askerr;
              return User.findById(receiverId).exec();
            }, function(err) {
              winston.log('error', 'Error nudging user: %s', err.toString());
              throw err;
            }).then(function(receiver) {
              if (!receiver) {
                throw new Error('No receiver found');
              }
              // Create a notification for the prompt
              var notification = new Notification({
                user    : { id: receiver._id, name: receiver.username },
                message : asker.username + ' wants you to add more expert categories. Enhance your profile and get more investments!',
              });
              notification.save();
              return res.status(200).send('Sent request to ' + receiver.username + '!');
            }, function(err) {
              winston.log('error', 'Error nudging user: %s', err);
              throw err;
            });
          }
          catch(err) {
            return res.status(501).send(err);
          }
        },
      },

      get: function(req, res) {
        var cb = function(err, user) {
          if (err) {
            winston.log('error', 'Error getting user: %s', err);
            return res.status(501).send(err);
          } else if (!user) {
            winston.log('info', 'No user found with id: %s', req.params.user_id);
            return res.status(501).send('No user was found');
          } else {
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
        if (!utils.validateUserInputs(req)) {
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
            user.location         = req.body.location || user.location;
            user.username         = req.body.username || user.username;
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
                return res.status(200).send(user);
              }
            });
          }
        });
      },

      delete: function(req, res) {
        var userId = req.params.user_id;
        User.remove({ _id: userId }, function(err, user) {
          if (err) {
            winston.log('error', 'Error finding user: %s', err);
            return res.status(501).send(err);
          } else if (!user) {
            winston.log('info', 'No user found with id: %s', userId);
            return res.status(501).send('No user was found with id: ' + userId);
          } else {
            return res.status(200).send(user);
          }
        });
      },

      investorCategory: {
        delete: function(req, res) {
          var userId = req.params.user_id;
          var categoryName = req.params.category_name;

          // Decrement the number of investors in the category
          var category = Category.findByName(categoryName).then(function(category) {
            if (!category) {
              winston.log('error', 'Error finding category: %s', categoryName);
              res.status(501).send('No category found with name ' + categoryName);
            }

            category.investors -= 1;

            // Update the user and the experts that the user invested in
            User.findById(userId, function(err, investor) {
              if (err) {
                winston.log('error', 'Error finding investor: %s', err);
                return res.status(501).send(err);
              } else if (!investor) {
                winston.log('info', 'No user found with id: %s', userId);
                return res.status(501).send('No user found with id: ' + userId);
              // If the user is not investor for the category, just return the user
              } else if (!utils.isInvestor(investor, categoryName)) {
                return res.status(200).send(investor);
              } else {
                // Undo this investors activities in the category
                // Remove investments, decrement category market share
                utils.undoInvestorActivityForCategory(category, investor, function(err, user) {
                  if (err) {
                    winston.log('error', 'Error undoing investor activity: %s', err.toString());
                    return res.status(501).send(err);
                  }
                  utils.updatePercentilesAndDividends(category.name, null, function(err) {
                    if (err) {
                      winston.log('error', 'Error updating percentiles: %s', err.toString());
                      return res.status(400).send(err);
                    }
                    return res.status(200).send(user);
                  });
                });
              }
            });
          }, function(err) {
            winston.log('error', 'Error finding category: %s', categoryName);
            return res.status(501).send(err);
          });
        },
      },

      expertCategory: {
        delete: function(req, res) {
          var categoryName = req.params.category_name;
          var userId = req.params.user_id;

          // Decrement the number of investors in the category
          var category = Category.findByName(categoryName).then(function(category) {
            category.experts -= 1;

            User.findById(userId, function(err, user) {
              if (err) {
                winston.log('error', 'Error finding user: %s', err);
                return res.status(501).send(err);
              } else if (!user) {
                winston.log('info', 'No user found with id: %s', userId);
                return res.status(501).send('No user found with id: ' + userId);
              // If the user is not an expert for this category, just return the user
              } else if (!utils.isExpert(user, categoryName)) {
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
                      }
                      utils.updatePercentilesAndDividends(categoryName, null, function(err) {
                        if (err) {
                          winston.log('error', 'Error updating percentiles: %s', err.toString());
                          return res.status(400).send(err);
                        }
                        return res.status(200).send(user);
                      });
                    });
                  }
                });
              }
            });
          }, function(err) {
            winston.log('info', 'Error finding category: %s', categoryName);
            return res.status(501).send(err);
          });
        }
      },
    },

    // /users/:categoryName/leaders
    leaders: {
      get: function(req, res) {
        if (!utils.validateLeadersInputs(req)) {
          return res.status(412).send('Invalid inputs');
        }

        var categoryName = req.params.categoryName;
        var expert = req.query.expert === '1';

        User.findUserByCategoryPublic(categoryName, expert, function(err, leaders) {
          if (err) {
            winston.log('error', 'Error finding users: %s', err);
            return res.status(501).send(err);
          } else {
            // sort the users in decreasing order of directScore
            var percentileComparator = utils.getPercentileComparator(categoryName, expert);
            leaders = leaders.sort(percentileComparator);
            return res.status(200).send(leaders.slice(0,10));
          }
        });
      }
    },
  }
};

module.exports = UserHandler;
