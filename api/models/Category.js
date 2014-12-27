// api/models/Category.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name          : { type: String, required: true, unique: true },
  repsLiquid    : { type: Number, default: 0, required: true },
  repsInvested  : { type: Number, default: 0, required: true },
  reps          : { type: Number, default: 0, required: true },
  experts       : { type: Number, required: true, default: 0 },
  investors     : { type: Number, required: true, default: 0 },
  timeStamp     : { type: Date, default: Date.now },
  color         : { type: String, required: true, default: '#000' },
  ownerName     : { type: String },
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
