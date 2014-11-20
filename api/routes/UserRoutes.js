// Routes to manipulate Users
var User = require('../models/User.js');
var utils = require('./utils.js');

// Routes that begin with /users
// ---------------------------------------------------------------------------
module.exports = function(router, isAuthenticated) {
  router.route('/users/list/byids')
    // Get all of the users for the given list
    .get(isAuthenticated, function(req, res) {
      User.find({ '_id': { $in: req.query.idList }}, function(err, users) {
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
        User.findBySearchTerm(req.query.searchTerm, function(err, users) {
          if (err) {
            res.send(err);
          } else {
            res.json(users);
          }
        });
      }
 
      // Get the users normally
      else {
        User.find(function(err, users) {
          if (err) {
            res.send(err);
          } else {
            console.log("found all the users???");
            console.log("\n\n");
            res.json(users);
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
              res.status(501).send(err.errors.phoneNumber.message);
            } else if (err.errors.password) {
              res.status(501).send(err.errors.password.message);
            } else {
              res.status(501).send("Fields cannot be blank");
            }
          // If the error is not from Mongoose, try parsing MongoDB errors
          } else if (err.err.indexOf('email') !== -1) {
            res.status(501).send("Email is already taken");
          } else if (err.err.indexOf('phoneNumber') !== -1) {
            res.status(501).send("Phone number is already taken");
          // Otherwise, send back generic "Error" message
          } else {
            res.status(501).send("Error");
          }
        } else {
          req.login(user, function(err) {
            if (err) {
              res.status(400).send(err);
            } else {
              res.send(user);
            }
          });
        }
      });
    });

/////// Routes that have /users/:user_id ///////////
  router.route('/users/:user_id')
    // Get the user with the provided id
    .get(isAuthenticated, function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
        if (err){
          res.send(err);
        } else {
          res.send(user);
        }
      });
    })

    // Update the user with this id
    // This route cannot be used to change the user's categories or portfolio
    .put(isAuthenticated, function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
        if (err) {
          res.send(err);
        } else {
          user.about            = req.body.about || user.about;
          user.username         = req.body.username || user.username;
          user.password         = req.body.password || user.password;
          user.phoneNumber      = req.body.phoneNumber || user.phoneNumber;
          user.defaultCategory  = req.body.defaultCategory || user.defaultCategory;
          user.picture          = req.body.picture || user.picture;

          if (req.body.links) {
            if (req.body.links[0] == "EMPTY") {
              user.links = [];
            } else {
              user.links = req.body.links;
            }
          }

          user.save(function(err) {
            if (err) {
              res.send(err);
            } else {
              res.send(user);
            }
          });
        }
      });
    })

    // Delete the user with this id
    .delete(isAuthenticated, function(req, res) {
       // Remove the user
       User.remove({ _id: req.params.user_id }, function(err, user) {
         if (err) {
           res.send(err);
         } else {
           res.send('Successfully deleted user');
         }
       });
    });
 
  ///////// Get n leaders for a category ///////
  router.route('/users/:categoryName/leaders/:count')
    .get(isAuthenticated, function(req, res) {
      User.findNLeaders(req.params.categoryName, parseInt(req.params.count), function(err, leaders) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(leaders);
        }
      });
    });
 
  /////////// Add an expert category if it is not already added
  router.route('/users/:userId/expert')
    .put(isAuthenticated, function(req, res) {
      User.findOneAndUpdate(
        {_id: req.params.userId, "categories.name": {$ne: req.body.name}},
        {$push: {categories: req.body}},
        function(err, user) {
          if (err) {
            res.status(501).send(err);
          } else {
            res.send(user);
          }
      });
    });
 
  /////////// Add an investor category if it not already added
  router.route('/users/:userId/investor')
    .put(isAuthenticated, function(req, res) {
      User.findOneAndUpdate(
        {_id: req.params.userId, "portfolio.category": {$ne: req.body.category}},
        {$push: { portfolio: req.body}},
        function(err, user) {
          if (err) {
            res.status(501).send(err);
          } else {
            res.send(user);
          }
      });
    });
};
