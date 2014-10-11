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
    return this.find( { $or: [ { to.name : username }, { from.name: username } ] }, cb);
};

module.exports = mongoose.model('Transaction', TransactionSchema);
