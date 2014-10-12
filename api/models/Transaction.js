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

TransactionSchema.statics.findByUsernameAll = function(username, cb) {
    return this.find( { $or: [ { "to.name" : username }, { "from.name" : username } ] }, cb);
};

// Get all transactions from a given user
TransactionSchema.statics.findByUsernameFrom = function(username, cb) {
    return this.find( { "from.name" : username }, cb);
};

// Get all transactions to a given user
TransactionSchema.statics.findByUsernameTo = function(username, cb) {
    return this.find( { "to.name" : username }, cb);
};

// Get all transactions for a given category
TransactionSchema.statics.findByCategory = function(category, cb) {
  return this.find( { category : category }, cb);
};

module.exports = mongoose.model('Transaction', TransactionSchema);
