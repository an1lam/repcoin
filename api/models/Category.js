// api/models/Category.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function toLower(w) {
  return w.toLowerCase();
}

var CategorySchema = new Schema({
  name          : { type: String, required: true, unique: true, set: toLower },
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

// Get the members in this category
// Set expert to true for experts, false for investors
CategorySchema.statics.getMembers = function(categories, expert) {
  var fields = { name: 1 };
  if (expert) {
    fields['experts'] = 1;
  } else {
    fields['investors'] = 1;
  }
  return this.find({ name: { $in: categories } }, fields).exec();
};

CategorySchema.statics.findByName = function(name) {
  return this.where( { "name": name }).findOne().exec();
};

CategorySchema.statics.findBySearchTerm = function(searchTerm) {
  return this.find( { "name": { $regex: new RegExp('\\b' + searchTerm, 'i') }} ).exec();
};

module.exports = mongoose.model('Category', CategorySchema);
