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

  router.post('/login/facebook/token',
    passport.authenticate('facebook-token'),
    function (req, res) {
      // do something with req.user
      res.send(req.user? 200 : 401);
    }
  );

  // Redirect the user to Facebook for authentication.  When complete,
  // Facebook will redirect the user back to the application at
  //     /auth/facebook/callback
  router.get('/login/facebook', passport.authenticate('facebook'));

  // Facebook will redirect the user to this URL after approval.  Finish the
  // authentication process by attempting to obtain an access token.  If
  // access was granted, the user will be logged in.  Otherwise,
  // authentication has failed.
  router.get('/login/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/',
                                        failureRedirect: '/' }));

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
      req.logout();
      return res.status(200).end();
    });
};
