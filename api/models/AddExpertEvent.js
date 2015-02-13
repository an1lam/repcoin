var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddExpertEventSchema = new Schema({
  username: { type: String, required: true },
  userId: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, default: 'addexpert', required: true },
  timeStamp: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model('AddExpertEvent', AddExpertEventSchema);
