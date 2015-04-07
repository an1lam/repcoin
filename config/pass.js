var Notification = require('../api/models/Notification.js');
var User = require('../api/models/User.js');
var utils = require('../api/routes/utils.js');
var winston = require('winston');

module.exports = function(passport, LocalStrategy, FacebookTokenStrategy) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(username, password, next) {
      User.findOne({ email: username }, function(err, user) {

        if (err) {
          return next(err, false);
        }

        if (!user || !password) {
          return next(
            { message: 'Unrecognized email address or no password given' },
            false, {});
        }

        if (!user.comparePassword(password)) {
          return next({ message: 'Incorrect email and password combination' }, false, {});
        }

        if (!user.verified) {
          return next({ message: 'User needs to verify their account before log in'}, false, {});
        }

        return next(null, user);
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
      clientSecret: clientSecret,
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
      User.findOne({ facebookId: profile.id }, function(err, user) {
        if (err) {
          return done(err);
        }

        // If the user does not exist, then create it
        if (!user) {
          // If the user was invited, then pay the inviter
          utils.giveInviterRepsForSharing(req.body.inviterId, req.body.hash, function(err) {
            if (err) {
              winston.log('error', 'Error paying inviter reps: %s', err.toString());
            }
          });

          if (profile._json.email) {
            user = User({
              firstname: profile.displayName.split(' ')[0],
              username: profile.displayName,
              facebookId: profile.id,
              verified: true,
              email: profile._json.email
            });
          } else {
            user = User({
              firstname: profile.displayName.split(' ')[0],
              username: profile.displayName,
              facebookId: profile.id,
              verified: true
            });
          }

          user.save(function(err, user) {
            if (err) {
              return done(err);
            }

            // Create a welcome notification
            var notification = new Notification({
              user: { id: user._id, name: user.username },
              message: 'Welcome to Repcoin!'
            });
            notification.save();

            // Create a join event
            utils.createEvent('join', [user.username, user._id]);

            return done(null, user);
          });
        }

        // Check if the user does not have an email address and we found one
        if (!user.email && profile._json.email) {
          user.email = profile._json.email;
          user.save(function(err, user) {
            if (err) {
              return done(err);
            }

            return done(null, user);
          });
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
