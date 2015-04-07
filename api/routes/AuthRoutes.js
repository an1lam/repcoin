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

  router.post('/login/facebook',
    passport.authenticate('facebook-token'), function(req, res) {
      var user = req.user || {};
      return res.status(200).send(user);
    });

  // TODO: Revert this for the beta release
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
    .post(function(req, res, next) {
      passport.authenticate('local', function(err, user, info) {
        if (!user || err) {
          var message;
          if (!err || !err.message) {
            message = 'Authentication failed';
          } else {
            message = err.message;
          }

          return res.status(412).send(message);
        }

        req.logIn(user, function(err) {
          if (err) {
            return res.status(412).send(err.message);
          }

          return res.status(200).send(user);
        });
      })(req, res, next);
    });

  router.route('/logout')
    .post(function(req, res) {
      req.logout();
      return res.status(200).end();
    });
};
