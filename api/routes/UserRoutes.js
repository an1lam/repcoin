'use strict';

// Models
var User = require('../models/User.js');
var VerificationToken = require('../models/VerificationToken.js');

// Modules
var utils = require('./utils.js');
var winston = require('winston');

var transporter = require('../../config/mailer.js').transporterFactory();

// Routes that begin with /users
// ---------------------------------------------------------------------------
module.exports = function(router, isAuthenticated, acl) {
  // Add an expert category to a given user
  function addExpertCategory(req, res, category) {
    var userId = req.params.user_id;
    User.findOneAndUpdate(
      {_id: userId, 'categories.name': {$ne: category.name}},
      {$push: {categories: { name: category.name, id: category._id } }},
      function(err, user) {
        if (err) {
          winston.log('error', 'Error finding user: %s', err);
          return res.status(501).send(err);
        } else if (!user) {
          winston.log('info', 'User with id %s is already an expert for category %s',
            userId, category.name);
          return res.status(501).send('User is already an expert for this category');
        } else {
          // Add to the expert count
          category.experts += 1;
          category.save();
          utils.updateExpertPercentiles(category.name, function(err) {
            if (err) {
              winston.log('error', 'Error updating expert percentiles: %s', err);
              return res.status(501).send(err);
            } else {
              User.findById(userId, function(err, user) {
                if (err) {
                  winston.log('error', 'Error finding user: %s', err);
                  return res.status(501).send(err);
                } else {
                  winston.log('info', 'Found user: %s', user.email);
                  return res.status(200).send(user);
                }
              });
            }
          });
        }
    });
  };

  // Add an investor category to a given user
  function addInvestorCategory(req, res, category) {
    var userId = req.params.user_id;
    User.findOneAndUpdate(
      {_id: userId, 'portfolio.category': {$ne: category.name}},
      {$push: { portfolio: { category: category.name, id: category._id } }},
      function(err, user) {
        if (err) {
          winston.log('error', 'Error updating user: %s', err);
          return res.status(501).send(err);
        } else if (!user) {
          winston.log('info', 'User with id %s is already an expert for category %s',
            userId, category.name);
          return res.status(501).send('User is already an investor for this category');
        } else {
          category.investors += 1;
          category.save();
          utils.updateInvestors(category.name, function(err) {
            if (err) {
              winston.log('error', 'Error updating investor percentiles: %s', err);
              return res.status(501).send(err);
            } else {
              User.findById(userId, function(err, user) {
                if (err) {
                  winston.log('error', 'Error finding user: %s', err);
                  return res.status(501).send(err);
                } else {
                  winston.log('info', 'Found user: %s', user.email);
                  return res.status(200).send(user);
                }
              });
            }
          });
        }
    });
  };

  // Get leaders for a given category and count
  // Set expert to true for expert category, false for investor
  function getLeaders(req, res) {
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
        return res.status(400).send(err);
      } else {
        // sort the users in decreasing order of directScore
        var percentileComparator = utils.getPercentileComparator(categoryName, expert);
        winston.log('info', 'Found %s leaders for category %s', count, categoryName);
        return res.send(leaders.sort(percentileComparator));
      }
    });
  };

  router.route('/users/list/byids')
    // Get all of the users for the given list
    .get(isAuthenticated, function(req, res) {
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
   });

  router.route('/users')
    // Get all of the users
    .get(isAuthenticated, function(req, res) {
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
    })

    // Create a new user
    .post(function(req, res) {
      winston.log('info', 'POST /users');
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
          var msg = '';

          // Mongoose validation errors are put in err.errors
          if (err.errors) {
            if (err.errors.phoneNumber) {
              msg = err.errors.phoneNumber.message;
            } else if (err.errors.password) {
              msg = err.errors.password.message;
            } else {
              msg = 'Fields cannot be blank';
            }
            winston.log('error', 'Error creating user: %s', msg);
            return res.status(501).send('Fields cannot be blank');

          // If the error is not from Mongoose, try parsing MongoDB errors
          } else if (err.err.indexOf('email') !== -1) {
            msg = 'Email is already taken';
          } else if (err.err.indexOf('phoneNumber') !== -1) {
            msg = 'Phone number is already taken';
          } else {
            // Otherwise, send back generic 'Error' message
            msg = 'Error';
          }
          winston.log('error', 'Error creating user: %s', msg);
          return res.status(501).send(msg);
        } else {
          var verificationString = utils.generateVerificationToken();

          var verificationToken = new VerificationToken({
              user: user.email,
              string: verificationString,
          });

          verificationToken.save(function(err) {
            if (err) {
              winston.log('error', 'Error saving verification token: %s', err);
              return res.status(501).send('Unable to save new verificationToken');
            }
            var mailOptions = utils.generateVerificationEmailOptions(user.email, verificationString);

            transporter.sendMail(mailOptions, function(err, info) {
              if (err) {
                winston.log('error', 'Error sending email: %s', err);
                return res.status(554).send(err);
              } else {
                winston.log('error', 'Sent email to: %s', user.email);
                return res.status(200).end();
              }
            });
          });
        }
      });
    });

/////// Routes that have /users/:user_id ///////////
  router.route('/users/:user_id')
    // Get the user with the provided id
    .get(isAuthenticated, function(req, res) {
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
    })

    // Update the user with this id
    // This route cannot be used to change the user's categories or portfolio
    .put(isAuthenticated, acl.isAdminOrSelf, function(req, res) {
      winston.log('info', 'PUT /users/%s', req.params.user_id);
      if (!utils.validateUserInputs(req)) {
        winston.log('info', 'Invalid inputs');
        return res.status(412).send('Invalid inputs');
      }

      User.findById(req.params.user_id, function(err, user) {
        if (err) {
          winston.log('error', 'Error finding user: %s', err);
          return res.status(501).send(err);
        } else if (!user) {
          winston.log('info', 'No user found with id: %s', req.params.user_id);
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
              winston.log('info', 'Invalid link inputs: %s', req.body.links);
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
              winston.log('error', 'Error saving user: %s', err);
              return res.status(501).send(err);
            } else {
              winston.log('info', 'Saved user with id: %s', req.params.user_id);
              return res.status(200).send(user);
            }
          });
        }
      });
    })

    // Delete the user with this id
    .delete(isAuthenticated, acl.isAdminOrSelf, function(req, res) {
      winston.log('info', 'DELETE /users/%s', req.params.user_id);
      // Remove the user
      User.remove({ _id: req.params.user_id }, function(err, user) {
        if (err) {
          winston.log('error', 'Error finding user: %s', err);
          return res.status(501).send(err);
        } else if (!user) {
          winston.log('info', 'No user found with id: %s', req.params.user_id);
          return res.status(501).send('No user was found');
        } else {
          winston.log('info', 'Found user with id: %s', req.params.user_id);
          return res.status(200).send('Successfully deleted user');
        }
      });
    });

  ///////// Get n leaders for a category ///////
  router.route('/users/:categoryName/leaders/:count')
    .get(isAuthenticated, function(req, res) {
      winston.log('info', 'GET /users/%s/leaders/%s', req.params.categoryName, req.params.count);
      getLeaders(req, res);
    });

  // Add an expert category if it is not already added
  // Create the category if it does not exist
  router.route('/users/:user_id/addexpert/:category_name')
    .put(isAuthenticated, acl.isAdminOrSelf, function(req, res) {
      var categoryName = req.params.category_name;
      winston.log('info', 'PUT /users/%s/addexpert/%s', userId, categoryName);

      Category.findByName(categoryName).then(function(category) {
        if (category) {
          return addExpertCategory(req, res, category);
        } else {
          winston.log('info', 'Creating category: $s', categoryName);
          var newCategory = { name: categoryName };
          newCategory.save(function(err, category) {
            if (err) {
              winston.log('error', 'Error creating category: %s', err);
              return res.status(503).send(err);
            } else {
              return addExpertCategory(req, res, category);
            }
          });
        }
      }, function(err) {
        winston.log('error', 'Error finding category: %s', err);
        return res.status(503).send(err);
      });
    });

  // Add an investor category if it not already added
  // Create the category if it does not exist
  router.route('/users/:user_id/addinvestor/:category_name')
    .put(isAuthenticated, acl.isAdminOrSelf, function(req, res) {
      var categoryName = req.params.category_name;
      winston.log('info', '/users/%s/addinvestor/%s', req.params.user_id, req.params.category_name);

      Category.findByName(categoryName).then(function(category) {
        if (category) {
          return addInvestorCategory(req, res, category);
        } else {
          winston.log('info', 'Creating category: $s', categoryName);
          var newCategory = { name: categoryName };
          newCategory.save(function(err, category) {
            if (err) {
              winston.log('error', 'Error creating category: %s', err);
              return res.status(503).send(err);
            } else {
              return addInvestorCategory(req, res, category);
            }
          });
        }
      }, function(err) {
        winston.log('error', 'Error finding category: %s', err);
        return res.status(503).send(err);
      });
    });

  // Delete an expert category
  router.route('/users/:user_id/:category_name/expert/delete')
    .put(isAuthenticated, acl.isAdminOrSelf, function(req, res) {
      winston.log('info', 'PUT /users/%s/%s/expert/delete', req.params.user_id, req.params.category_name);
      var categoryName = req.params.category_name;
      User.findById(req.params.user_id, function(err, user) {
        if (err) {
          winston.log('error', 'Error finding user: %s', err);
          return res.status(501).send(err);
        } else if (!user) {
          winston.log('info', 'No user found with id: %s', req.params.user_id);
          return res.status(501).send('No user was found');
        // If the user is not an expert for this category, just return the user
        } else if (!utils.isExpert(user, categoryName)) {
          winston.log('info', 'User %s is already an expert for %s', user.email, categoryName);
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
              user.save(function(err) {
                if (err) {
                  winston.log('error', 'Error saving user: %s', err);
                  return res.status(501).send(err);
                } else {
                  winston.log('info', 'Saved user: %s', user.email);
                  return res.status(200).send(user);
                }
              });
            }
          });
        }
      });
    });

  // Delete an investor category
  router.route('/users/:user_id/:category_name/investor/delete')
    .put(isAuthenticated, acl.isAdminOrSelf, function(req, res) {
      winston.log('info', 'PUT /users/%s/%s/investor/delete', req.params.user_id, req.params.category_name);
      var categoryName = req.params.category_name;
      User.findById(req.params.user_id, function(err, user) {
        if (err) {
          winston.log('error', 'Error finding user: %s', err);
          return res.status(501).send(err);
        } else if (!user) {
          winston.log('info', 'No user found with id: %s', req.params.user_id);
          return res.status(501).send('No user was found');
        // If the user is not investor for the category, just return the user
        } else if (!utils.isInvestor(user, categoryName)) {
          winston.log('info', 'User %s is already an investor for %s', user.email, categoryName);
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
              user.save(function(err) {
                if (err) {
                  winston.log('error', 'Error saving user: %s', err);
                  return res.status(501).send(err);
                } else {
                  winston.log('info', 'Saved user: %s', user.email);
                  return res.status(200).send(user);
                }
              });
            }
          });
        }
      });
    });

  // Verify a user who has signed up for the site
  router.route('/verify')
    .post(function(req, res) {
      winston.log('info', 'POST /verify');
      var token = req.body.verificationToken;

      if (!token) {
        winston.log('info', 'No verification token provided');
        return res.status(412).send('No verification token provided');
      }
      VerificationToken.findOneAndRemove({ 'string': token }, function(err, verifiedUser) {
        if (err) {
          winston.log('error', 'Error finding verification token: %s', err);
          return res.status(501).send(err);
        } else if (!verifiedUser || !verifiedUser.user) {
          winston.log('info', 'Verification token not found in DB');
          return res.status(501).send('User verfication token not found in DB');
        }

        User.findOneAndUpdate(
          { 'email': verifiedUser.user }, { 'verified': true },
          function(err, user) {
            if (err) {
              winston.log('error', 'Error updating user: %s', err);
              return res.status(404).send(err);
            }
            req.login(user, function(err) {
              if (err) {
                winston.log('error', 'Error logging in user: %s', err);
                return res.status(400).send(err);
              } else {
                winston.log('info', 'Successully verified user: %s', user.email);
                return res.status(200).send(user);
              }
            });
          }
        );
      });
    });
};
