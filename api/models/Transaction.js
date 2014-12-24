// api/models/Transaction.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
  category : { type: String, required: true },
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

// Get filtered transactions based on conditions, obscuring private fields
// Sorted from most recent to least recent
TransactionSchema.statics.findPublic = function(conditions) {
  return this.aggregate([
    { $match: conditions },
    { $project: privateFilter },
    { $sort: { "timeStamp": -1}}
  ]).exec();
};

// Get a transaction with the given id, obscuring anonymous fields
TransactionSchema.statics.findByIdPublic = function(id) {
  return this.findPublic( { _id: mongoose.Types.ObjectId(id) });
};

// Get all public transactions to a given user
TransactionSchema.statics.findByUserIdToPublic = function(userId) {
  userId = mongoose.Types.ObjectId(userId);
  var to = { "to.id" : userId };
  return this.findPublic(to)
};

// Get all public transactions involving a given user
TransactionSchema.statics.findByUserIdAllPublic = function(userId) {
  userId = mongoose.Types.ObjectId(userId);
  var all = {
    $or: [ { "to.id" : userId },
           { "from.id" : userId, "from.anonymous" : false }
         ]
  };
  return this.findPublic(all);
};

// Get all public transactions from a given user
TransactionSchema.statics.findByUserIdFromPublic = function(userId) {
    userId = mongoose.Types.ObjectId(userId);
    var from = {"from.id" : userId, "from.anonymous": false };
    return this.findPublic(from);
};

// Get all public transactions between two users
TransactionSchema.statics.findByUserIdUsPublic = function(userId1, userId2) {
    userId1 = mongoose.Types.ObjectId(userId1);
    userId2 = mongoose.Types.ObjectId(userId2);
    var between = {
      $or: [ { "from.id" : userId1, "from.anonymous": false, "to.id" : userId2 },
        { "from.id": userId2, "from.anonymous": false, "to.id": userId1 }
      ]
    };
    return this.findPublic(between);
};

// Get all transactions for a given category
// Sorted from most recent to least recent
TransactionSchema.statics.findByCategoryPublic = function(category) {
  return this.findPublic({ category: category});
};

module.exports = mongoose.model('Transaction', TransactionSchema);
