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
  "portfolio.investments": 0,
};

var passwordValidator = [
  validate({
    validator: 'isLength',
    arguments: [8],
    message: 'Password must be at least 8 characters'
  })
];

function toLower(w) {
  return w.toLowerCase();
}

var UserSchema = new Schema({
  facebookId: { type: String, index: { unique: true, sparse: true } },
  firstname: {type: String, required: true, trim: true },
  lastname: {type: String, trim: true },
  username: {type: String, required: true, trim: true },
  password: {type: String, validate: passwordValidator },
  email: {type: String, index: { unique: true, sparse: true }, trim: true },
  about: {type: String, trim: true },
  location: {type: String, trim: true },

  // The reps this user has to invest
  reps: { type: Number, required: true, default: 5 },

  // The investor categories for this user
  portfolio: [{

    // DEPRECATED
    // reps available to invest for this category
    reps: {type: Number },

    // ROI for this category based on all transactions for this category
    // DEPRECATED
    roi: {
      value   : { type: Number },
      length  : { type: Number },
    },

    // DEPRECATED
    // Percentile relative to all investors in this category
    percentile: {type: Number, default: 0, required: true },

    // The rank for this category
    rank: { type: Number, default: 0, required: true },

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
      amount: {type: Number},

      // The current valuation of the amount
      // DEPRECATED
      valuation: {type: Number },

      // The percentage of the user
      percentage: {type: Number, required: true },

      // The dividend being given to the user
      dividend: { type: Number, required: true, default: 0 }
    }],
  }],

  // Default category, used for the SuperScore
  defaultCategory: String,

  // A list of expert categories
  categories: [{

    // The name of the category
    name: {type: String, required: true, set: toLower },

    // The id of the category
    id: {type: Schema.Types.ObjectId, required: true },

    // DEPRECATED
    // The percentile for this user compared to users in this category
    percentile: {type: Number, default: 0, required: true },

    // DEPRECATED
    // The percentile from yesterday
    previousPercentile: {type: Number, default: 0, required: true },

    // The reps received for this category
    reps: {type: Number, default: 5, required: true },

    // The rank for this category
    rank: { type: Number, default: 0, required: true },

    // The rank from yesterday
    previousRank: { type: Number, default: 0, required: true },

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

  // Round user reps to the nearest hundredth
  if (user.categories) {
    for (var i = 0; i < user.categories.length; i++) {
      user.categories[i].reps = Math.floor(user.categories[i].reps * 100)/100;
    }
  }

  if (user.portfolio) {
    for (var i = 0; i < user.portfolio.length; i++) {
      user.portfolio[i].reps = Math.floor(user.portfolio[i].reps * 100)/100;
    }
  }

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

// Set expert to true for expert category, false for investor category
UserSchema.statics.findUserByCategoryPublic = function(category, expert, cb) {
  if (expert) {
    return this.find( { "categories.name": category }, privateFields ).exec(cb);
  } else {
    return this.find( { "portfolio.category": category }, privateFields ).exec(cb);
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

// Find the top 10 leaders by timestamp
UserSchema.statics.getLeadersByTimeStamp = function(high) {
  return this.find({}, privateFields)
    .sort({ "timeStamp": high })
    .limit(10)
    .exec();
};

// Find the top 10 leaders by investor reps
UserSchema.statics.getLeadersByExpertReps = function(high) {
  return this.find({}, privateFields)
    .sort({ "categories.reps": high })
    .limit(10)
    .exec();
};

// Get top ranked user ids for a given investor category, descending
// Ranking done by total reps
// Only returns the username, picture, rank, and reps for the category
UserSchema.statics.findTopRankedInvestors = function(category) {
  return this.aggregate([
    { $match: { "portfolio.category": category }},
    { $unwind: "$portfolio" },
    { $match: { "portfolio.category": category }},
    { $sort: { "portfolio.rank": 1 }},
    { $project: { _id: 1, picture: 1, "portfolio.rank": 1, username: 1 }},
    { $limit: 10 },
  ]).exec();
};

// Get top ranked user ids for a given expert category, descending
// Ranking done by total reps
// Only returns the username, picture, rank, and reps for the category
UserSchema.statics.findTopRankedExperts = function(category) {
  return this.aggregate([
    { $match: { "categories.name": category }},
    { $unwind: "$categories" },
    { $match: { "categories.name": category }},
    { $sort: { "categories.rank": 1 }},
    { $project: { _id: 1, picture: 1, "categories.rank": 1, "categories.reps": 1, username: 1 }},
    { $limit: 10 },
  ]).exec();
};

// Get ranked user ids for a given expert category, descending
// Ranking done by total reps
// Only returns the IDs of the users in ranked order
UserSchema.statics.findRankedExperts = function(category) {
  return this.aggregate([
    { $match: { "categories.name": category }},
    { $unwind: "$categories" },
    { $match: { "categories.name": category }},
    { $sort: { "categories.reps": -1 }},
    { $project: { _id: 1 }},
  ]).exec();
};

// Get ranked user ids for a given expert category, decreasing
// Ranking done by total dividends
UserSchema.statics.findRankedInvestors = function(category) {
  return this.aggregate([
    { $match: { "portfolio.category": category }},
    { $unwind: "$portfolio" },
    { $unwind: "$portfolio.investments" },
    { $match: { "portfolio.category": category } },
    { $group: { _id: "$_id", dividends: { $sum: "$portfolio.investments.dividend" } }},
    { $sort: { "dividends": -1 }},
    { $project: { "_id": 1 } },
  ]).exec();
};

// Update the rank for a given investor and category
UserSchema.statics.updateRank = function(userId, categoryName, rank, expert, cb) {
  if (expert) {
    return this.update(
      { _id: mongoose.Types.ObjectId(userId), "categories.name": categoryName },
      { $set: { "categories.$.rank": rank } }
    ).exec(cb);
  } else {
    return this.update(
      { _id: mongoose.Types.ObjectId(userId), "portfolio.category": categoryName },
      { $set: { "portfolio.$.rank": rank } }
    ).exec(cb);
  }
};

// Update the investments for a given investor and category
// Used to update dividends upon a transaction occurring
UserSchema.statics.updateInvestments = function(userId, categoryName, investments, cb) {
  return this.update(
    { _id: userId, "portfolio.category": categoryName },
    { $set: { "portfolio.$.investments": investments } }
  ).exec(cb);
};

// Get investments for a given category for investors who have invested in the given user
// Used to update dividends for all investors who invested in this user for this category
// We cannot say for sure that the investment made in the user is the one we want for this category
// Since there could be many investments in this user
UserSchema.statics.findInvestments = function(userId, category) {
  return this.aggregate([
    { $match: { "portfolio.category": category, "portfolio.investments.userId": mongoose.Types.ObjectId(userId) }},
    { $unwind: "$portfolio" },
    { $match: { "portfolio.category": category } },
    { $project: { _id: 1, investments: "$portfolio.investments" } }
  ]).exec();
};

UserSchema.statics.getUserPictureAboutCategories = function (userId) {
  return this.findById(userId, 'picture about categories').exec();
};

// Get top ranked user ids for a given investor category, descending
// Ranking done by total reps
// Only returns the username, picture, rank, and reps for the category
UserSchema.statics.findTopRankedInvestors = function(category) {
  return this.aggregate([
    { $match: { "portfolio.category": category }},
    { $unwind: "$portfolio" },
    { $match: { "portfolio.category": category }},
    { $sort: { "portfolio.rank": 1 }},
    { $project: { _id: 1, picture: 1, "portfolio.rank": 1, username: 1 }},
    { $limit: 10 },
  ]).exec();
};

// Get top ranked user ids for a given expert category, descending
// Ranking done by total reps
// Only returns the username, picture, rank, and reps for the category
UserSchema.statics.findTopRankedExperts = function(category) {
  return this.aggregate([
    { $match: { "categories.name": category }},
    { $unwind: "$categories" },
    { $match: { "categories.name": category }},
    { $sort: { "categories.rank": 1 }},
    { $project: { _id: 1, picture: 1, "categories.rank": 1, "categories.reps": 1, username: 1 }},
    { $limit: 10 },
  ]).exec();
};

// Get ranked user ids for a given expert category, descending
// Ranking done by total reps
// Only returns the IDs of the users in ranked order
UserSchema.statics.findRankedExperts = function(category) {
  return this.aggregate([
    { $match: { "categories.name": category }},
    { $unwind: "$categories" },
    { $match: { "categories.name": category }},
    { $sort: { "categories.reps": -1 }},
    { $project: { _id: 1 }},
  ]).exec();
};

// Get ranked user ids for a given expert category, decreasing
// Ranking done by total dividends
UserSchema.statics.findRankedInvestors = function(category) {
  return this.aggregate([
    { $match: { "portfolio.category": category }},
    { $unwind: "$portfolio" },
    { $unwind: "$portfolio.investments" },
    { $match: { "portfolio.category": category } },
    { $group: { _id: "$_id", dividends: { $sum: "$portfolio.investments.dividend" } }},
    { $sort: { "dividends": -1 }},
    { $project: { "_id": 1 } },
  ]).exec();
};

// Update the rank for a given investor and category
UserSchema.statics.updateRank = function(userId, categoryName, rank, expert, cb) {
  if (expert) {
    return this.update(
      { _id: mongoose.Types.ObjectId(userId), "categories.name": categoryName },
      { $set: { "categories.$.rank": rank } }
    ).exec(cb);
  } else {
    return this.update(
      { _id: mongoose.Types.ObjectId(userId), "portfolio.category": categoryName },
      { $set: { "portfolio.$.rank": rank } }
    ).exec(cb);
  }
};

// Update the investments for a given investor and category
// Used to update dividends upon a transaction occurring
UserSchema.statics.updateInvestments = function(userId, categoryName, investments, cb) {
  return this.update(
    { _id: userId, "portfolio.category": categoryName },
    { $set: { "portfolio.$.investments": investments } }
  ).exec(cb);
};

// Get investments for a given category for investors who have invested in the given user
// Used to update dividends for all investors who invested in this user for this category
// We cannot say for sure that the investment made in the user is the one we want for this category
// Since there could be many investments in this user
UserSchema.statics.findInvestments = function(userId, category) {
  return this.aggregate([
    { $match: { "portfolio.category": category, "portfolio.investments.userId": mongoose.Types.ObjectId(userId) }},
    { $unwind: "$portfolio" },
    { $match: { "portfolio.category": category } },
    { $project: { _id: 1, investments: "$portfolio.investments" } }
  ]).exec();
};

module.exports = mongoose.model('User', UserSchema);
