var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NewGhostEventSchema = new Schema({
  username: { type: String, required: true },
  userId: { type: String, required: true },
  ghostName: { type: String, required: true },
  ghostId: { type: String, required: true },
  type: { type: String, default: 'newghost', required: true },
  timeStamp: { type: Date, default: Date.now, required: true },
});

// Get the last 16 from a given date
// Used for pagination
NewGhostEventSchema.statics.findMostRecent = function(timeStamp) {
  return this.find({"timeStamp": { $lte: new Date(timeStamp) }}).sort({"timeStamp": -1}).limit(16).exec();
};

module.exports = mongoose.model('NewGhostEvent', NewGhostEventSchema);
