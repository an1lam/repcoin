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
          return done(null, false, { message: 'Unrecognized email address' });
        }
        if (!user.comparePassword(password)) {
          return done(null, false, { message: 'Incorrect email and password combination' });
        }
        if (!user.verified) {
          return done(null, false, { message: 'User needs to verify their account before log in'});
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
};
