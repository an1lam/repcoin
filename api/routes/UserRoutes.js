'use strict';
var User = require('../models/User.js');
var utils = require('./utils.js');

// Routes that begin with /users
// ---------------------------------------------------------------------------
module.exports = function(router, isAuthenticated, acl) {
  router.route('/users/list/byids')
    // Get all of the users for the given list
    .get(isAuthenticated, function(req, res) {
      if (!req.query.idList) {
        return res.status(412).send('No id list provided');
      }
      User.findPublic({ '_id': { $in: req.query.idList }}, function(err, users) {
        if (err) {
          return res.status(501).send(err);
        } else {
          return res.status(200).send(users);
        }
      });
   });

  router.route('/users')
    // Get all of the users
    .get(isAuthenticated, function(req, res) {
      // Check if we want to get the users with a search term
      if (req.query.searchTerm) {
        User.findBySearchTermPublic(req.query.searchTerm, function(err, users) {
          if (err) {
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
            return res.status(501).send(err);
          } else {
            return res.status(200).send(users);
          }
        });
      }
    })

    // Create a new user
    .post(function(req, res) {
      var user = new User({
          firstname   : req.body.firstname,
          lastname    : req.body.lastname,
          username    : req.body.firstname + ' ' + req.body.lastname,
          password    : req.body.password,
          email       : req.body.email,
          phoneNumber : req.body.phoneNumber,
      });
      user.save( function(err) {
        if (err) {
          // Mongoose validation errors are put in err.errors
          if (err.errors) {
            if (err.errors.phoneNumber) {
              return res.status(501).send(err.errors.phoneNumber.message);
            } else if (err.errors.password) {
              return res.status(501).send(err.errors.password.message);
            } else {
              return res.status(501).send('Fields cannot be blank');
            }
          // If the error is not from Mongoose, try parsing MongoDB errors
          } else if (err.err.indexOf('email') !== -1) {
            return res.status(501).send('Email is already taken');
          } else if (err.err.indexOf('phoneNumber') !== -1) {
            return res.status(501).send('Phone number is already taken');
          // Otherwise, send back generic 'Error' message
          } else {
            return res.status(501).send('Error');
          }
        } else {
          req.login(user, function(err) {
            if (err) {
              return res.status(400).send(err);
            } else {
              return res.status(200).send(user);
            }
          });
        }
      });
    });

/////// Routes that have /users/:user_id ///////////
  router.route('/users/:user_id')
    // Get the user with the provided id
    .get(isAuthenticated, function(req, res) {
      var cb = function(err, user) {
        if (err) {
          return res.status(501).send(err);
        } else if (!user) {
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
    })

    // Update the user with this id
    // This route cannot be used to change the user's categories or portfolio
    .put(isAuthenticated, acl.isAdminOrSelf, function(req, res) {
      if (!utils.validateUserInputs(req)) {
        return res.status(412).send('Invalid inputs');
      }

      User.findById(req.params.user_id, function(err, user) {
        if (err) {
          return res.status(501).send(err);
        } else if (!user) {
          return res.status(501).send('No user was found');
        } else {
          user.about            = req.body.about || user.about;
          user.username         = req.body.username || user.username;
          user.password         = req.body.password || user.password;
          user.phoneNumber      = req.body.phoneNumber || user.phoneNumber;
          user.defaultCategory  = req.body.defaultCategory || user.defaultCategory;
          user.picture          = req.body.picture || user.picture;

          if (req.body.links) {
            if (!utils.validateUserLinks(req.body.links)) {
              return res.status(412).send('Invalid link inputs');
            } 
            if (req.body.links[0] == 'EMPTY') {
              user.links = [];
            } else {
              user.links = req.body.links;
            }
          }

          user.save(function(err) {
            if (err) {
              return res.status(501).send(err);
            } else {
              return res.status(200).send(user);
            }
          });
        }
      });
    })

    // Delete the user with this id
    .delete(isAuthenticated, acl.isAdminOrSelf, function(req, res) {
       // Remove the user
       User.remove({ _id: req.params.user_id }, function(err, user) {
         if (err) {
           return res.status(501).send(err);
         } else if (!user) {
           return res.status(501).send('No user was found');
         } else {
           return res.status(200).send('Successfully deleted user');
         }
       });
    });
 
  ///////// Get n leaders for a category ///////
  router.route('/users/:categoryName/leaders/:count')
    .get(isAuthenticated, function(req, res) {
      User.findNLeadersPublic(req.params.categoryName, parseInt(req.params.count), function(err, leaders) {
        if (err) {
          return res.status(400).send(err);
        } else {
          // sort the users in decreasing order of directScore
          var directScoreComparator = utils.getDirectScoreComparator(req.params.categoryName);
          return res.send(leaders.sort(directScoreComparator));
        }
      });
    });
 
  /////////// Add an expert category if it is not already added
  router.route('/users/:user_id/expert')
    .put(isAuthenticated, acl.isAdminOrSelf, function(req, res) {
      User.findOneAndUpdate(
        {_id: req.params.user_id, 'categories.name': {$ne: req.body.name}},
        {$push: {categories: req.body}},
        function(err, user) {
          if (err) {
            return res.status(501).send(err);
          } else if (!user) {
            return res.status(501).send('User is already an expert for this category');
          } else {
            utils.updateExpertPercentiles(req.body.name, function(err) {
              if (err) {
                return res.status(501).send(err);
              } else {
                User.findById(req.params.user_id, function(err, user) {
                  if (err) {
                    return res.status(501).send(err);
                  } else {
                    return res.status(200).send(user);
                  }
                });
              }
            });
          }
      });
    });
 
  /////////// Add an investor category if it not already added
  router.route('/users/:user_id/investor')
    .put(isAuthenticated, acl.isAdminOrSelf, function(req, res) {
      User.findOneAndUpdate(
        {_id: req.params.user_id, 'portfolio.category': {$ne: req.body.category}},
        {$push: { portfolio: req.body}},
        function(err, user) {
          if (err) {
            return res.status(501).send(err);
          } else if (!user) {
            return res.status(501).send('User is already an investor for this category');
          } else {
            utils.updateInvestors(req.body.category, function(err) {
              if (err) {
                return res.status(501).send(err);
              } else {
                User.findById(req.params.user_id, function(err, user) {
                  if (err) {
                    return res.status(501).send(err);
                  } else {
                    return res.status(200).send(user);
                  }
                });
              }
            });
          }
      });
    });

  // Delete an expert category
  router.route('/users/:user_id/:category_name/delete')
    .put(isAuthenticated, acl.isAdminOrSelf, function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
        if (err) {
          return res.status(501).send(err);
        } else if (!user) {
          return res.status(501).send('No user was found');
        } else {
          // Save all of the investors in the category
          var investors = utils.getInvestors(user, req.params.category_name);
          if (!investors) {
            return res.status(412).send('User does not have expert category: ' + req.params.category_name);
          }
          utils.reimburseInvestors(investors, categoryName, user._id);

          user = utils.deleteExpertCategory(user, req.params.category_name); 
          user.save(function(err) {
            if (err) {
              return res.status(501).send(err);
            } else {
              return res.status(200).send(user);
            }
          });
        }
      });
    });
};
