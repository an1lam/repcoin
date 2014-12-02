// api/models/VerificationToken.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VerificationTokenSchema = new Schema({
  user   : { type: String, required: true, unique: true },
  string : { type: String, required: true, unique: true },
});

module.exports = mongoose.model('VerificationToken', VerificationTokenSchema);
