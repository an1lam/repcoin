var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt'),
  SALT_WORK_FACTOR = 10;
var validate = require('mongoose-validator');
var winston = require('winston');

// All of the fields that should be kept private
var privateFields = {
  "reps": 0,
  "portfolio.investments": 0,
  "timeStamp": 0
};

var UserStoreSchema = new Schema({

  // The id of the user to whom we refer
  id: { type: Schema.Types.ObjectId, required: true},

  // The reps this user has to invest
  reps: { type: Number },

  // The investor categories for this user
  portfolio: [{

    // Percentile relative to all investors in this category
    percentile: {type: Number, required: true },

    // Category for this portfolio entry
    category: {type: String, required: true },

    // Id of the category for this portfolio entry
    id: {type: Schema.Types.ObjectId, required: true },

    // A list of investments for this category
    investments: [{
      // The time of the investment
      timeStamp : {type: Date, required: true },

      // The id of the user invested in
      userId: {type: Schema.Types.ObjectId, required: true },

      // The name of the user invested in
      user: {type: String, required: true },

      // The amount invested in this user
      amount: {type: Number},

      // The percentage of the user
      percentage: {type: Number, required: true },

      // The dividend being given to the user
      dividend: { type: Number, required: true }
    }],
  }],

  // A list of expert categories
  categories: [{

    // The name of the category
    name: {type: String, required: true },

    // The id of the category
    id: {type: Schema.Types.ObjectId, required: true },

    // The percentile for this user compared to users in this category
    percentile: {type: Number, required: true},

    // The reps received for this category
    reps: {type: Number, required: true },

    // A list of investors who hold reps in this user for this category
    investors: [{
      name: {type: String, required: true },
      id: {type: Schema.Types.ObjectId, required: true }
    }],
  }],

  timeStamp : {type: Date, default: Date.now, required: true },
});

// Get all the users, obscuring private fields
UserStoreSchema.statics.findPublic = function(query, cb) {
  return this.find(query, privateFields, cb);
};

// Get the user with a given id, obscuring private fields
UserStoreSchema.statics.findByIdPublic = function(id, cb) {
  return this.find({"id": id} , privateFields, cb);
};

// Find all the users who are experts in a category
UserStoreSchema.statics.findExpertByCategory = function(category, cb) {
  return this.find({ "categories.name": category }).exec(cb);
};

// Find all the users who are investors in a category
UserStoreSchema.statics.findInvestorByCategory= function(category, cb) {
  return this.find({ "portfolio.category": category }).exec(cb);
};

module.exports = mongoose.model('UserStore', UserStoreSchema);
