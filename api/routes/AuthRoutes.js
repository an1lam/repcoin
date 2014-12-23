// api/routes/AuthRoutes.js
// Routes to login, logout, and signup
var winston = require('winston');

module.exports = function(router, passport) {
  /*
  Passportjs automatically stores a user's session.
  This is done via a cookie, and the result can be observed
  in req.user or checked with req.isAuthenticated(). This means
  that querying loggedin requires no data on the part of the client.
  The incoming request to the middleware will inherently be signed
  as loggedin or not.
  */
  router.route('/loggedin')
    .get(function(req, res) {
      return res.status(200).send(req.isAuthenticated());
    });

  // Get the current user. Null if no user logged in
  router.route('/user')
    .get(function(req, res) {
      return res.status(200).send(req.user);
    });

  router.route('/login')
    .post(passport.authenticate('local'), function(req, res) {
      if (req.user) {
        winston.log('info', 'Logged in user: %s', req.body.email);
      }
      var user = req.user || {};
      return res.status(200).send(user);
    });

  router.route('/logout')
    .post(function(req, res) {
      winston.log('info', 'Logged out user: %s', req.user.email);
      req.logout();
      return res.status(200).end();
    });
};
