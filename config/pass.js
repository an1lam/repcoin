var User = require('../api/models/User.js');

module.exports = function(passport, LocalStrategy, FacebookStrategy, FacebookTokenStrategy) {
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

  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://www.repcoin.net/"
    },
    function(accessToken, refreshToken, profile, done) {
      User.find({ email: profile.emails[0] }, function(err, user) {
        if (err) { return done(err); }
        done(null, user);
      });
    }
  ));

  // Determine if using production URL or localhost
  if (process.env.NODE_ENV === 'production') {
    var clientID = process.env.FACEBOOK_APP_ID;
    var clientSecret = process.env.FACEBOOK_APP_SECRET;
  } else {
    var clientID = process.env.FACEBOOK_DEV_APP_ID;
    var clientSecret = process.env.FACEBOOK_DEV_APP_SECRET;
  }

  passport.use(new FacebookTokenStrategy({
      clientID: clientID,
      clientSecret: clientSecret
    },
    function(accessToken, refreshToken, profile, done) {
      User.find({ email: profile.id }, function (err, user) {
        return done(err, user);
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
