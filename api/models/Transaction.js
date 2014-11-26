// api/models/Transaction.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

// Get all transactions to a given user
// Sorted from most recent to least recent
TransactionSchema.statics.findByUserIdTo = function(userId) {
    return this.find( { "to.id" : userId }).sort({ "timeStamp": -1 }).exec();
};

// Get all transactions involving a given user where the user is not anonymous
// Sorted from most recent to least recent
TransactionSchema.statics.findByUserIdAllPublic = function(userId) {
    return this.find( { $or: [ { "to.id" : userId }, { "from.id" : userId, "from.anonymous" : false } ] }).sort({ "timeStamp": -1 }).exec();
};

// Get all transactions from a given user where the user is not anonymous
// Sorted from most recent to least recent
TransactionSchema.statics.findByUserIdFromPublic = function(userId) {
    return this.find( { "from.id" : userId, "from.anonymous": false }).sort({ "timeStamp": -1 }).exec();
};

// Get all public transactions between two users 
// Sorted from most recent to least recent
TransactionSchema.statics.findByUserIdUsPublic = function(userId1, userId2) {
    return this.find( { $or: [ { "from.id" : userId1, "from.anonymous": false, "to.id" : userId2 },
      { "from.id": userId2, "from.anonymous": false, "to.id": userId1 } ] }).sort({ "timeStamp": -1 }).exec();
};

// Get all transactions for a given category
// Sorted from most recent to least recent
TransactionSchema.statics.findByCategory = function(category) {
  return this.find( { category : category }).sort({ "timeStamp": -1 }).exec();
};

module.exports = mongoose.model('Transaction', TransactionSchema);
