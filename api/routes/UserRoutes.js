// Routes to manipulate Users

var User = require('../models/User.js');
// Routes that begin with /users
// ---------------------------------------------------------------------------
module.exports = function(router) {
  router.route('/users')
    // Get all of the users
    .get(function(req, res) {
      User.find(function(err, users) {
        if (err) {
          res.send(err);
        } else {
          res.json(users);
        }
      });
    })

    // Create a new user
    .post(function(req, res) {
      var user = new User({
          username    : req.body.username,
          password    : req.body.password,
          email       : req.body.email,
          phoneNumber : req.body.phoneNumber,
      });
      user.save( function(err) {
        if (err) {
          res.status(400).send(err);
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
// TODO (ritterm) : Authenticate these routes before production!!!!
    // Get the user with the provided id
  router.route('/users/:user_id')
    .get(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
        if (err){
          res.send(err);
        } else {
          res.send(user);
        }
      });
    })

    // Update the user with this id
    .put(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
        if (err) {
          res.send(err);
        } else {
          user.username    = req.body.username || user.username;
          user.password    = req.body.password || user.password;
          user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
          user.categories  = req.body.categories || user.categories;
          user.portfolio   = req.body.portfolio || user.portfolio;
          user.links       = req.body.links || user.links;
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
   .delete(function(req, res) {
      // Remove the user
      User.remove({ _id: req.params.user_id }, function(err, user) {
        if (err) {
          res.send(err);
        } else {
          res.send('Successfully deleted user');
        }
      });
   });
};
