// Routes to manipulate Users

// TODO: fix spacing and if (err) formatting
var User = require('../models/User.js');
// Routes that begin with '/users
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
          phoneNumber : req.body.phoneNumber
      });
      user.save( function(err) {
        if (err) {
          res.send(err);
        } else {
          req.login(user, function(err) {
            if (err) {
              res.send(err);
            } else {
              res.send(user);
            }
          });
        }  
      });
    });
};
