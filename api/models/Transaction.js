// api/models/Transaction.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var winston = require('winston');

// Fields to include and obscure for public transaction information
// Used in an aggregate() to appropriately filter documents
var privateFilter = {
  "to.name": 1,
  "to.id": 1,
  "from.anonymous": 1,
  "from.name": { $cond: [ "$from.anonymous", "", "$from.name" ] },
  "from.id": { $cond: [ "$from.anonymous", "", "$from.id" ] },
  "amount": 1,
  "category": 1,
  "timeStamp": 1
};

function toLower(w) {
  return w.toLowerCase();
}

var TransactionSchema = new Schema({
  to : {
    name : { type: String, required: true },
    id : { type: Schema.Types.ObjectId, required: true },
  },
  from : {
    anonymous : { type: Boolean, required: true, default: false },
    name : { type: String, required: true },
    id : { type: Schema.Types.ObjectId, required: true },
  },
  amount : { type: Number, required: true },
  category : { type: String, required: true, set: toLower },
  timeStamp : { type: Date, default: Date.now, required: true },
});

// Get all transactions involving a given user
// Sorted from most recent to least recent
TransactionSchema.statics.findByUserIdAll = function(userId) {
    return this.find( { $or: [ { "to.id" : userId }, { "from.id" : userId } ] }).sort({ "timeStamp": -1 }).exec();
};

// Get all transactions from a given user
// Sorted from most recent to least recent
TransactionSchema.statics.findByUserIdFrom = function(userId) {
    return this.find( { "from.id" : userId }).sort({ "timeStamp": -1 }).exec();
};

// Get the trending experts for a given time period
TransactionSchema.statics.findTrendingExperts = function(timeStamp, category) {
  return this.aggregate([
    { $match:
      {
        timeStamp: { $gte: new Date(timeStamp) },
        category: category,
      },
    },
    { $project: { "to.id": 1 } },
    { $group: { _id: "$to.id", count: {$sum: 1} }  },
    { $sort: { "count": -1 } },
  ]).exec();
};

// Get the last 16 transactions involving to a given user
// Used for pagination
TransactionSchema.statics.findMostRecentToUser = function(timeStamp, userId) {
  userId = mongoose.Types.ObjectId(userId);
  return this.aggregate([
    { $match: { "timeStamp": { $lte: new Date(timeStamp) }, "to.id": userId } },
    { $project: privateFilter },
    { $sort: { "timeStamp": -1}},
    { $limit: 16 },
  ]).exec();
};

// Get the last 16 transactions involving a given user
// Used for pagination
TransactionSchema.statics.findMostRecentAllUser = function(timeStamp, userId) {
  userId = mongoose.Types.ObjectId(userId);
  return this.aggregate([
    { $match: {
        "timeStamp": { $lte: new Date(timeStamp) },
        $or: [
          { "to.id" : userId },
          { "from.id" : userId, "from.anonymous" : false },
        ],
      }
    },
    { $project: privateFilter },
    { $sort: { "timeStamp": -1}},
    { $limit: 16 },
  ]).exec();
};

// Get the last 16 transactions involving from a given user
// Used for pagination
TransactionSchema.statics.findMostRecentFromUser = function(timeStamp, userId) {
  userId = mongoose.Types.ObjectId(userId);
  return this.aggregate([
    { $match: { "timeStamp": { $lte: new Date(timeStamp) }, "from.id" : userId, "from.anonymous": false } },
    { $project: privateFilter },
    { $sort: { "timeStamp": -1}},
    { $limit: 16 },
  ]).exec();
};

// Get the last 16 transactions involving between two users
// Used for pagination
TransactionSchema.statics.findMostRecentBetweenUsers = function(timeStamp, userId1, userId2) {
  userId1 = mongoose.Types.ObjectId(userId1);
  userId2 = mongoose.Types.ObjectId(userId2);
  return this.aggregate([
    { $match: {
        "timeStamp": { $lte: new Date(timeStamp) },
        $or: [
          { "from.id" : userId1, "from.anonymous": false, "to.id" : userId2 },
          { "from.id": userId2, "from.anonymous": false, "to.id": userId1 }
        ]
      }
    },
    { $project: privateFilter },
    { $sort: { "timeStamp": -1}},
    { $limit: 16 },
  ]).exec();
};

// Get the last 16 from a given date
// Used for pagination
TransactionSchema.statics.findMostRecentByCategory = function(timeStamp, category) {
  return this.aggregate([
    { $match: { "timeStamp": { $lte: new Date(timeStamp) }, "category": category } },
    { $project: privateFilter },
    { $sort: { "timeStamp": -1}},
    { $limit: 16 },
  ]).exec();
};

// Get the last 16 from a given date
// Used for pagination
TransactionSchema.statics.findMostRecent = function(timeStamp) {
  return this.aggregate([
    { $match: { "timeStamp": { $lte: new Date(timeStamp) }} },
    { $project: privateFilter },
    { $sort: { "timeStamp": -1}},
    { $limit: 16 },
  ]).exec();
};

// Get the total number of reps that have been traded
TransactionSchema.statics.getTotalRepsTraded = function() {
  return this.aggregate([
    {
      $project: {
        amount: {
          $cond: [
            { $lt: ['$amount', 0] },
            {$subtract: [0, '$amount'] },
            '$amount'
          ]
        }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount'} } }
  ]).exec();
};

TransactionSchema.statics.getHotCategories = function(userId) {
  var d1 = new Date();
  d1.setDate(d1.getDate() - 7);
  return this.aggregate([
    {
      $match: {
        timeStamp: {
          $gte: d1, $lt: new Date()
        },
      }
    },
    {
      $project: {
        volume: {
          $cond: [
            {
              $lt: [ "$amount", 0]
            },
            -1,
            1
          ]
        },
        "category": 1
      }
    },
    { $group: { _id: "$category", volume: { $sum: "$volume" } }},
    { $sort: { volume: -1 } },
    { $limit: 6 }
  ]).exec();
};

TransactionSchema.statics.getHotUsersInCategory = function(category) {
  var d1 = new Date();
  d1.setDate(d1.getDate() - 7);
  return this.aggregate([
    {
      $match: {
        timeStamp: {
          $gte: d1,
          $lt: new Date()
        },
        category: category
      }
    },
    {
      $project:
        {
          volume:
            {
              $cond: [
               { $lt: [ "$amount", 0] },
               -1,
                1
              ]
            },
          "to.id": 1,
          "to.name": 1
          }
        },
    {
      $group: {
        _id: {id: "$to.id", name: "$to.name"},
        volume: { $sum: "$volume" }
      }
    },
    { $sort: { volume: -1 } },
    { $limit: 3 }
  ]).exec();
};

module.exports = mongoose.model('Transaction', TransactionSchema);
