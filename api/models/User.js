var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt'),
  SALT_WORK_FACTOR = 10;
var validate = require('mongoose-validator');
var winston = require('winston');

// All of the fields that should be kept private
var privateFields = {
  "facebookId": 0,
  "email": 0,
  "password": 0,
  "portfolio.reps": 0,
  "portfolio.investments": 0,
  "timeStamp": 0
};

var passwordValidator = [
  validate({
    validator: 'isLength',
    arguments: [8],
    message: 'Password must be at least 8 characters'
  })
];

var UserSchema = new Schema({
  facebookId: { type: String, index: { unique: true, sparse: true } },
  firstname: {type: String, required: true, trim: true },
  lastname: {type: String, trim: true },
  username: {type: String, required: true, trim: true },
  password: {type: String, validate: passwordValidator },
  email: {type: String, index: { unique: true, sparse: true }, trim: true },
  about: {type: String, trim: true },

  // A list of investments for various categories
  portfolio: [{
    // reps available to invest for this category
    reps: {type: Number, default: 0, required: true },

    // ROI for this category based on all transactions for this category
    // DEPRECATED
    roi: {
      value   : { type: Number },
      length  : { type: Number },
    },

    // Percentile relative to all investors in this category
    percentile: {type: Number, default: 0, required: true },

    // Category for this portfolio entry
    category: {type: String, required: true },

    // Id of the category for this portfolio entry
    id: {type: Schema.Types.ObjectId, required: true },

    // A list of investments for this category
    investments: [{
      // The time of the investment
      timeStamp : {type: Date, default: Date.now, required: true },

      // The id of the user invested in
      userId: {type: Schema.Types.ObjectId, required: true },

      // The name of the user invested in
      user: {type: String, required: true },

      // The amount invested in this user
      amount: {type: Number, required: true },

      // The current valuation of the amount
      // DEPRECATED
      valuation: {type: Number },

      // The percentage of the user
      percentage: {type: Number, required: true },

      // The dividend being given to the user
      dividend: { type: Number, required: true }
    }],
  }],

  // Default category, used for the SuperScore
  defaultCategory: String,

  // A list of expert categories
  categories: [{

    // The name of the category
    name: {type: String, required: true },

    // The id of the category
    id: {type: Schema.Types.ObjectId, required: true },

    // The percentile for this user compared to users in this category
    percentile: {type: Number, default: 0, required: true },

    // The percentile from yesterday
    previousPercentile: {type: Number, default: 0, required: true },

    // The reps received for this category
    reps: {type: Number, default: 0, required: true },

    // A list of investors who hold reps in this user for this category
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
    url: { type: String },
    public_id: { type: String } // Only for CDN pictures, not facebook
  },

  // Indicates whether the user has verified their account post-signup
  verified: {
    type: Boolean,
    default: false,
    required: true,
  },
  timeStamp : {type: Date, default: Date.now, required: true },
});

UserSchema.pre('validate', function(next) {
  var user = this;

  if (user.facebookId) {
    return next();
  }

  if (!user.email) {
    return next(new Error('Validation Error: Missing email'));
  } else if (!user.password) {
    return next(new Error('Validation Error: Missing password'));
  }
  return next();
});

// TODO: Abstract this logic out into it's own function for testing purposes
UserSchema.pre('save', function(next) {
  var user = this;

  if (!user.password && user.facebookId) {
    return next();
  }

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      winston.log('error', 'Error generating salt');
      return next(err);
    }

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          winston.log('error', 'Error hashing password for user: %s', user._id);
          return next(err);
        }

        // Override the cleartext password with the hashed one
        user.password = hash;
        return next();
    });
  });
});

UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

// Get all the users, obscuring private fields
UserSchema.statics.findPublic = function(query, cb) {
  return this.find(query, privateFields, cb);
};

// Get the user with a given id, obscuring private fields
UserSchema.statics.findByIdPublic = function(id, cb) {
  return this.findById(id, privateFields, cb);
};

// Get all the users whose first or last name start with searchTerm
UserSchema.statics.findBySearchTermPublic = function(searchTerm, cb) {
  return this.find({ "username": { $regex: new RegExp('\\b' + searchTerm, 'i') }}, privateFields, cb);
};

// Find N Leaders for a given category
// Set expert to true for expert category, false for investor category
UserSchema.statics.findNLeadersPublic = function(category, count, expert, cb) {
  if (expert) {
    return this.find( { "categories.name": category }, privateFields ).limit(parseInt(count)).exec(cb);
  } else {
    return this.find( { "portfolio.category": category }, privateFields ).limit(parseInt(count)).exec(cb);
  }
};

// Find all the users who are experts in a category
UserSchema.statics.findExpertByCategory = function(category, cb) {
  return this.find({ "categories.name": category }).exec(cb);
};

// Find all the users who are investors in a category
UserSchema.statics.findInvestorByCategory= function(category, cb) {
  return this.find({ "portfolio.category": category }).exec(cb);
};

module.exports = mongoose.model('User', UserSchema);
