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
  amount : { type: Number },
  category : { type: String, required: true },
  timeStamp : { type: Date, default: Date.now }, 
});

// Get all transactions involving a given user
TransactionSchema.statics.findByUserIdAll = function(userId, cb) {
    return this.find( { $or: [ { "to.id" : userId }, { "from.id" : userId } ] }, cb);
};

// Get all transactions from a given user
TransactionSchema.statics.findByUserIdFrom = function(userId, cb) {
    return this.find( { "from.id" : userId }, cb);
};

// Get all transactions to a given user
TransactionSchema.statics.findByUserIdTo = function(userId, cb) {
    return this.find( { "to.id" : userId }, cb);
};

// Get all transactions involving a given user where the user is not anonymous
TransactionSchema.statics.findByUserIdAllPublic = function(userId, cb) {
    return this.find( { $or: [ { "to.id" : userId }, { "from.id" : userId, "from.anonymous" : false } ] }, cb);
};

// Get all transactions from a given user where the user is not anonymous
TransactionSchema.statics.findByUserIdFromPublic = function(userId, cb) {
    return this.find( { "from.id" : userId, "from.anonymous": false }, cb);
};

// Get all public transactions between two users
TransactionSchema.statics.findByUserIdUsPublic = function(userId1, userId2, cb) {
    return this.find( { $or: [ { "from.id" : userId1, "from.anonymous": false, "to.id" : userId2 },
      { "from.id": userId2, "from.anonymous": false, "to.id": userId1 } ] }, cb);
};

// Get all transactions for a given category
TransactionSchema.statics.findByCategoryPublic = function(category, cb) {
  return this.find( { category : category, "from.anonymous": false }, cb);
};

module.exports = mongoose.model('Transaction', TransactionSchema);
