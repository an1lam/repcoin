var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt'),
  SALT_WORK_FACTOR = 10;
var validate = require('mongoose-validator');
var phone = require('phone');

var passwordValidator = [
  validate({
    validator: 'isLength',
    arguments: [8],
    message: 'Password must be at least 8 characters'
  })
];

var phoneValidator = [
  validate({
    validator: function(val) {
      return phone(val, 'USA').length > 0;  
    },
    message: 'Invalid phone number'
  })
];

var UserSchema = new Schema({
  firstname: {type: String, required: true, trim: true },
  lastname: {type: String, required: true, trim: true },
  username: {type: String, required: true, trim: true },
  password: {type: String, required: true, validate: passwordValidator },
  email: {type: String, required: true, unique: true, trim: true },
  phoneNumber: {type: String, required: true, unique: true, trim: true, validate: phoneValidator },
  about: {type: String, trim: true },
  portfolio: [{
    repsAvailable: {type: Number, default: 0, required: true },
    percentile: {type: Number, default: 0, required: true },
    category: {type: String, required: true },
    id: {type: Schema.Types.ObjectId, required: true },
    investments: [{
      userId: {type: Schema.Types.ObjectId, required: true },
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
    reps: {type: Number, default: 0, required: true },
    investors: [{
      name: {type: String, required: true },
      id: {type: Schema.Types.ObjectId, required: true }
    }],
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

// Get all the users whose first or last name start with searchTerm
UserSchema.statics.findBySearchTerm = function(searchTerm, cb) {
  return this.find({ "username": { $regex: new RegExp('\\b' + searchTerm, 'i') }}, cb);
};

UserSchema.statics.findNLeaders = function(category, count, cb) {
  var directScore = "categories." + category + ".directScore";
  return this.find( { "categories.name": category } ).sort( { directScore: -1 } ).limit(10).exec(cb);
};

// Find all the users who are experts in a category in increasing order of reps
UserSchema.statics.findExpertByCategoryIncOrder = function(category, cb) {
  var reps = "categories." + category + ".reps";
  return this.find({ "categories.name": category }).sort({ reps: 1 }).exec(cb);
};

// Find all the users who are investors in a category in increasing order of reps
UserSchema.statics.findInvestorByCategoryIncOrder = function(category, cb) {
  var repsAvailable = "portfolio." + category + ".repsAvailable";
  return this.find({ "portfolio.category": category }).sort({ repsAvailable: 1 }).exec(cb);
};

module.exports = mongoose.model('User', UserSchema);
