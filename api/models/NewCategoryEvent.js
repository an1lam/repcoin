var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NewCategoryEventSchema = new Schema({
  username: { type: String, required: true },
  userId: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, default: 'newcategory', required: true },
  timeStamp: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model('NewCategoryEvent', NewCategoryEventSchema);
