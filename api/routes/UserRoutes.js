'use strict';

// Models
var Category = require('../models/Category.js');
var User = require('../models/User.js');
var PasswordResetToken = require('../models/PasswordResetToken.js');
var VerificationToken = require('../models/VerificationToken.js');

// Modules
var utils = require('./utils.js');
var winston = require('winston');

// Handlers
var UserHandler = require('../handlers/user.js');

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
                } else if (!user) {
                  winston.log('info', 'No user found with id: %s', userId);
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
      {$push: { portfolio: { category: category.name, id: category._id, reps: 5 } }},
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
          category.reps += 5;
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
                } else if (!user) {
                  winston.log('info', 'No user found with id: %s', userId);
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

  router.get('/users/list/byids', isAuthenticated, UserHandler.users.listByIds.get)
  router.get('/users', isAuthenticated, UserHandler.users.get);
  router.post('/verify', UserHandler.verify.post);

  router.route('/users')
    // Create a new user
    .post(function(req, res) {
      winston.log('info', 'POST /users');

      if (!utils.validateCreateUserInputs(req)) {
        return res.status(412).send('Invalid inputs');
      }

      var user = new User({
          firstname   : req.body.firstname,
          lastname    : req.body.lastname,
          username    : req.body.firstname + ' ' + req.body.lastname,
          password    : req.body.password,
          email       : req.body.email,
      });
      user.save( function(err) {
        if (err) {
          var msg = '';

          // Mongoose validation errors are put in err.errors
          if (err.errors) {
            if (err.errors.password) {
              msg = err.errors.password.message;
            } else {
              msg = 'Fields cannot be blank';
            }
            winston.log('error', 'Error creating user: %s', msg);
            return res.status(501).send('Fields cannot be blank');

          // If the error is not from Mongoose, try parsing MongoDB errors
          } else if (err.err.indexOf('email') !== -1) {
            msg = 'Email is already taken';
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

  router.get('/users/:user_id', isAuthenticated, UserHandler.users.userId.get);
  router.delete('/users/:user_id', isAuthenticated, acl.isAdminOrSelf, UserHandler.users.userId.delete);
  router.put('/users/:user_id', isAuthenticated, acl.isAdminOrSelf, UserHandler.users.userId.put);

  // Get leaders for a given category and count. Set expert to '1' for expert category, else for investor
  router.get('/users/:categoryName/leaders/:count', isAuthenticated, UserHandler.users.leaders.get);

  // Add an expert category if it is not already added
  // Create the category if it does not exist
  router.route('/users/:user_id/addexpert/:category_name')
    .put(isAuthenticated, acl.isAdminOrSelf, function(req, res) {
      var categoryName = req.params.category_name;
      winston.log('info', 'PUT /users/%s/addexpert/%s', req.params.user_id, categoryName);

      Category.findByName(categoryName).then(function(category) {
        if (category) {
          return addExpertCategory(req, res, category);
        } else {
          winston.log('info', 'Creating category: %s', categoryName);
          var newCategory = new Category({ name : categoryName });
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
          winston.log('info', 'Creating category: %s', categoryName);
          var newCategory = new Category({ name : categoryName });
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

  // Delete an expert category for a user
  router.put('/users/:user_id/:category_name/expert/delete', isAuthenticated, acl.isAdminOrSelf,
    UserHandler.users.userId.expertCategory.delete);

  // Delete an investor category for a user
  router.put('/users/:user_id/:category_name/investor/delete', isAuthenticated, acl.isAdminOrSelf,
    UserHandler.users.userId.investorCategory.delete);

  // Reset a user's password by sending them an email with a reset link
  router.route('/users/sendPasswordResetEmail')
    .post(function(req, res) {
      var email = req.body.email;
      winston.log('info', 'User with email %s resetting their password', email);
      if (!email) {
        winston.log('error', 'No email provided in password reset request.');
        return res.status(412).send('No email address provided');
      }

      User.findOne({'email': email }, function(err, user) {
        if (err) {
          winston.log('error', 'Failed to send password reset email to user %s: %s.', email, err);
          return res.status(503).send('Error finding user for ' + email + '. Please try again.');
        } else if (!user) {
          winston.log('info', 'Will not send password reset email to unrecognized address: %s', email);
          return res.status(412).send('Unrecognized email address');
        } else if (user.facebookId) {
          winston.log('info', 'User with email: %s is a facebook account', email);
          return res.status(412).send('Users who sign up with facebook do not have a Repcoin email address');
        }

        var randomString = utils.generateVerificationToken();
        var resetToken = new PasswordResetToken({
          user: user.email,
          string: randomString,
        });

        resetToken.save(function(err) {
          if (err) {
            winston.log('error', 'Failed to save password reset token for user %s: %s.', email, err);
            return res.status(501).send(err);
          }

          // Send an email with a link to reset the user's password
          var mailOptions = utils.generatePasswordResetEmailOptions(
            user.email, randomString);

          transporter.sendMail(mailOptions, function(err, info) {
            if (err) {
              winston.log('error', 'Failed to send email to user %s: %s', email, err);
              return res.status(554).send(err);
            } else {
              winston.log('info', 'Successfully emailed user %s with password reset link.', email);
              return res.status(200).end();
            }
          });
        });
      });
    });

  router.route('/users/newPassword')
    .post(function(req, res) {
      var token = req.body.token;
      var newPassword = req.body.password;

      if (!(token && newPassword)) {
        return res.status(412).send('No token provided');
      }

      PasswordResetToken.findOneAndRemove({ 'string': token }, function(err, passwordResetToken) {
        if (err) {
          winston.log('error', 'Error finding password reset token: %s', err);
          return res.status(501).send(err);
        } else if (!(passwordResetToken && passwordResetToken.user)) {
          winston.log('error', 'The user provided (%s) was invalid.', email);
          return res.status(501).send('User verfication token not found in DB');
        } else {
          var email = passwordResetToken.user;
          User.findOne(
            {'email': email}, function(err,user) {
              if (err) {
                winston.log('error', 'Error updating %s\'s password: %s', email, err);
                return res.status(501).send(err);
              }

              user.password = newPassword;
              user.save(function(err) {
                if (err) {
                  winston.log('Unable to save user: %s', err);
                  return res.status(501).send(err);
                }

                req.login(user, function(err) {
                  if (err) {
                    winston.log('error', 'Error logging in user: %s', err);
                    return res.status(400).send(err);
                  } else {
                    winston.log('info', 'Successully update password for user: %s', user.email);
                    return res.status(200).send(user);
                  }
                });
              });
            }
          );
        }
      });
    });

};
