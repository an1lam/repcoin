var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSnapshotSchema = new Schema({

  // The id of the user to whom we refer
  id: { type: Schema.Types.ObjectId, required: true},

  // The reps this user has to invest
  reps: { type: Number },

  // The investor categories for this user
  portfolio: [{

    // DEPRECATED
    // Percentile relative to all investors in this category
    percentile: {type: Number, required: true },

    rank: { type: Number, required: true },

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

    // DEPRECATED
    // The percentile for this user compared to users in this category
    percentile: {type: Number, required: true},

    rank: { type: Number, required: true },
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

// Get ranked user ids for a given expert category, decreasing
// Ranking done by total dividends
UserSnapshotSchema.statics.findRankedInvestors = function(category, start, end) {
  return this.aggregate([
    { $match: { "portfolio.category": category, "timeStamp": { $gte: start, $lt: end } }},
    { $unwind: "$portfolio" },
    { $unwind: "$portfolio.investments" },
    { $match: { "portfolio.category": category } },
    { $group: { _id: "$_id", dividends: { $sum: "$portfolio.investments.dividend" } }},
    { $sort: { "dividends": -1 }},
    { $project: { "_id": 1 } },
  ]).exec();
};

// Get ranked user ids for a given expert category, descending
// Ranking done by total reps
// Only returns the IDs of the users in ranked order
UserSnapshotSchema.statics.findRankedExperts = function(category, start, end) {
  return this.aggregate([
    { $match: { "categories.name": category, "timeStamp": { $gte: start, $lt: end } }},
    { $unwind: "$categories" },
    { $match: { "categories.name": category }},
    { $sort: { "categories.reps": -1 }},
    { $project: { _id: 1 }},
  ]).exec();
};

// Update the rank for a given investor and category
UserSnapshotSchema.statics.updateRank = function(userId, categoryName, rank, expert, cb) {
  if (expert) {
    return this.update(
      { _id: mongoose.Types.ObjectId(userId), "categories.name": categoryName },
      { $set: { "categories.$.rank": rank } }
    ).exec();
  } else {
    return this.update(
      { _id: mongoose.Types.ObjectId(userId), "portfolio.category": categoryName },
      { $set: { "portfolio.$.rank": rank } }
    ).exec();
  }
};

module.exports = mongoose.model('UserSnapshot', UserSnapshotSchema);
