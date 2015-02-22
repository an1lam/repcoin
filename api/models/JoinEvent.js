// api/models/Event.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var JoinEventSchema = new Schema({
  name: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  type: { type: String, default: 'join', required: true },
  timeStamp: { type: Date, default: Date.now, required: true },
});

// Get the last 16 from a given date
// Used for pagination
JoinEventSchema.statics.findMostRecent = function(timeStamp) {
  return this.find({"timeStamp": { $lte: new Date(timeStamp) }}).sort({"timeStamp": -1}).limit(16).exec();
};

module.exports = mongoose.model('JoinEvent', JoinEventSchema);
