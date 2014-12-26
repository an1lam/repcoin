// api/models/PasswordResetToken.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PasswordResetTokenSchema = new Schema({
  user   : { type: String, required: true, unique: false },
  string : { type: String, required: true, unique: true },
});

module.exports = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);
