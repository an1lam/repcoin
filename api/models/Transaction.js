// api/models/Transaction.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
  to        : {
    name: { type: String, required: true },
    id: { type: String, required: true }
  },
  from      : {
    name: { type: String, required: true, default: 'Someone' },
    id: { type: String }
  },
  amount    : { type: Number },
  category  : { type: String, required: true }
});

TransactionSchema.statics.findByUsernameAll = function(username, cb) {
    return this.find( { $or: [ { to : username }, { from: username } ] }, cb);
};

module.exports = mongoose.model('Transaction', TransactionSchema);
