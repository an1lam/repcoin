// api/models/Category.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name          : { type: String, required: true, unique: true },
  repsLiquid    : { type: Number, required: true, default: 0 },
  repsInvested  : { type: Number, required: true, default: 0 },
  timeStamp     : { type: Date, required: true, default: Date.now },
  color         : { type: String, required: true, default: '#000' },
  ownerName     : { type: String, required: true },
  quotes        : [{
                    text    : { type: String, required: true },
                    owner   : { type: String, required: true },
                    ownerId : { type: Schema.Types.ObjectId, required: true },
                  }]
});

CategorySchema.statics.findByName = function(name) {
  return this.where( { "name": name }).findOne().exec();
};

CategorySchema.statics.findBySearchTerm = function(searchTerm) {
  return this.find( { "name": { $regex: new RegExp('\\b' + searchTerm, 'i') }} ).exec();
};

module.exports = mongoose.model('Category', CategorySchema);
