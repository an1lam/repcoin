// api/routes/AuthRoutes.js
// Routes to login, logout, and signup

module.exports = function(router, passport, acl) {
  /*
  Passportjs automatically stores a user's session.
  This is done via a cookie, and the result can be observed
  in req.user or checked with req.isAuthenticated(). This means
  that querying loggedin requires no data on the part of the client.
  The incoming request to the middleware will inherently be signed
  as loggedin or not.
  */

  router.post('/login/facebook', acl.isAdmin,
    passport.authenticate('facebook-token'), function (req, res) {
      var user = req.user || {};
      return res.status(200).send(user);
    });

  // TODO: Revert this for the beta release
  router.route('/loggedin')
    .get(function(req, res) {
      if (process.env.NODE_ENV !== 'production') {
        return res.status(200).send(req.isAuthenticated());
      }
      if (!req.user) {
        return res.status(200).send(false);
      }
      if (req.user.facebookId === process.env.MATT_RITTER_FACEBOOK_ID ||
          req.user.facebookId === process.env.STEPHEN_MALINA_FACEBOOK_ID) {
        return res.status(200).send(req.isAuthenticated());
      }
      return res.status(200).send(false);
    });

  // Get the current user. Null if no user logged in
  router.route('/user')
    .get(function(req, res) {
      return res.status(200).send(req.user);
    });

  router.route('/login')
    .post(acl.isAdmin, function(req, res, next) {
      passport.authenticate('local', function(err, user, info) {
        if (!user || err) { return res.status(412).send(err.message); }
        req.logIn(user, function(err) {
          if (err) { return res.status(412).send(err.message); }
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
