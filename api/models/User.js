// A User model with authentication

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt'),
  SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
  username: {type: String, required: true, index: { unique: true } },
  password: {type: String, required: true },
  phoneNumber: {type: String, required: true, unique: true },
  categories: [{
    name: String,
    id: Schema.Types.ObjectId,
    directScore: Number,
    crowdScore: Number,
    expertScore: Number,
  }],
  links: [{ url: String, title: String }],
  picture: {
    type: String,
    default: "https://assets-cdn.github.com/images/modules/logos_page/Octocat.png",
  },
  timeStamp : {type: Date, default: Date.now },
});

// TODO: Abstract this logic out into it's own function for testing purposes
UserSchema.pre('save', function(next) {
  var user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          return next(err);
        }

        // Override the cleartext password with the hashed one
        user.password = hash;
        next();
    });
  });
});

UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
