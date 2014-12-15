var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt'),
  SALT_WORK_FACTOR = 10;
var validate = require('mongoose-validator');
var phone = require('phone');

// All of the fields that should be kept private
var privateFields = {
  "email": 0,
  "password": 0,
  "phoneNumber": 0,
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

var phoneValidator = [
  validate({
    validator: function(val) {
      return phone(val, 'USA').length > 0;
    },
    message: 'Invalid phone number'
  })
];

var UserSchema = new Schema({
  // User's first and last name
  firstname: {type: String, required: true, trim: true },
  lastname: {type: String, required: true, trim: true },
  username: {type: String, required: true, trim: true },
  password: {type: String, required: true, validate: passwordValidator },
  // We use this field for logging in and logging out
  email: {type: String, required: true, unique: true, trim: true },
  phoneNumber: {type: String, required: true, unique: true, trim: true, validate: phoneValidator },
  about: {type: String, trim: true },

  // A list of investments for various categories
  portfolio: [{
    // reps available to invest for this category
    reps: {type: Number, default: 0, required: true },

    // ROI for this category based on all revokes for this category
    roi: {
      value   : { type: Number, default: 0, required: true },
      length  : { type: Number, default: 0, required: true },
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
      valuation: {type: Number, required: true },

      // The percentage of the user
      percentage: {type: Number, required: true }
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
    type: String,
    default: "https://assets-cdn.github.com/images/modules/logos_page/Octocat.png",
    required: true
  },
  timeStamp : {type: Date, default: Date.now, required: true },
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

UserSchema.statics.findNLeadersPublic = function(category, count, cb) {
  return this.find( { "categories.name": category }, privateFields ).limit(parseInt(count)).exec(cb);
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
