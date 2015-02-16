var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSnapshotSchema = new Schema({

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

module.exports = mongoose.model('UserSnapshot', UserSnapshotSchema);
