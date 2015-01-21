// api/models/Event.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var JoinEventSchema = new Schema({
  name: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  type: { type: String, default: 'join', required: true },
  timeStamp: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model('JoinEvent', JoinEventSchema);
