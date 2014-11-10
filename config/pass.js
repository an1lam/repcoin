var User = require('../api/models/User.js'); 

module.exports = function(passport, LocalStrategy) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
    },
    function(username, password, done) {
      User.findOne({ email: username }, function(err, user) {
        if (err) { 
          return done(err); 
        }
        if (!user) {
          return done(null, false, { message: 'Incorrect username' });
        }
        if (!user.comparePassword(password)) {
          return done(null, false, { message: 'Incorrect Password' });
        }
        return done(null, user);
      });
    }
  ));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}
