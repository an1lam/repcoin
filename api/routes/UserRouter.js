// Routes to manipulate Users

var User = require('../models/User.js');
// Routes that begin with '/users
// ---------------------------------------------------------------------------
module.exports = function(router) {
    router.route('/users')

      // Get all of the users
      .get(function(req, res) {
          User.find(function(err, users) {
              if (err)
                  res.send(err);
              res.json(users);
          });
      })

      // Create a new user
      .post(function(req, res) {
          new User({
              username      : req.body.username,
              password      : req.body.password,
              phoneNumber   : req.body.phoneNumber
          }).save( function(err) {
              if (err)
                  res.send(err);
              res.json({ message : 'User created' });
          });
      });
};
