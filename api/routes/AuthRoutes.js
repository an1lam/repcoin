// api/routes/AuthRoutes.js
// Routes to login, logout, and signup

module.exports = function(router, passport) {
  router.route('/loggedin')
    .get(function(req, res) {
      res.send(req.isAuthenticated());
    });

  router.route('/login')
    .post(passport.authenticate('local'), function(req, res) {
       var user = req.user || {};
       res.send(user); 
    });

  router.route('/logout')
    .post(function(req, res) {
      req.logout();
      res.status(200).end();
    });
};
