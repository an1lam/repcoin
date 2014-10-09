// api/models/Category.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name        : { type: String, required: true, unique: true },
  timeStamp   : { type: Date, default: Date.now },
  color       : { type: String, default: '#000' },
  ownerName   : { type: String, required: true },
  quotes      : [ String ] 
});

module.exports = mongoose.model('Category', CategorySchema);
