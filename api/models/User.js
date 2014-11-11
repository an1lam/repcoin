var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt'),
  SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
  firstname: {type: String, required: true },
  lastname: {type: String, required: true },
  username: {type: String, required: true },
  password: {type: String, required: true },
  email: {type: String, required: true, unique: true },
  phoneNumber: {type: String, required: true, unique: true },
  about: String,
  portfolio: [{
    repsAvailable: {type: Number, default: 0, required: true },
    category: {type: String, required: true },
    id: {type: Schema.Types.ObjectId, required: true },
    investments: [{
      user: {type: String, required: true },
      amount: {type: Number, required: true },
      valuation: {type: Number, required: true },
      percentage: {type: Number, required: true }
    }],
  }],
  defaultCategory: String,
  categories: [{
    name: {type: String, required: true },
    id: {type: Schema.Types.ObjectId, required: true },
    directScore: {type: Number, default: 0, required: true },
    previousDirectScore: {type: Number, default: 0, required: true },
    expertScore: {type: Number, default: 0, required: true },
    reps: {type: Number, default: 0, required: true }
  }],
  links: [
    {
      url: {type: String, required: true },
      title: {type: String, required: true }
    }
  ],
  picture: {
    type: String,
    default: "https://assets-cdn.github.com/images/modules/logos_page/Octocat.png",
    required: true
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

UserSchema.statics.findBySearchTerm = function(searchTerm, cb) {
  return this.find({ "username": { $regex: new RegExp('\\b' + searchTerm, 'i') }}, cb);
};

UserSchema.statics.findNLeaders = function(category, count, cb) {
  return this.find( { "categories.name": category } ).sort( { "categories.directScore": -1 } ).limit(10).exec(cb);
};

module.exports = mongoose.model('User', UserSchema);
