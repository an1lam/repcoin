var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationSchema = new Schema({
  user      : {
    id      : { type: String, required: true },
    name    : { type: String, required: true },
  },
  viewed    : { type: Boolean, required: true, default: false },
  message   : { type: String, required: true },
  timeStamp : { type: Date, default: Date.now, required: true },
});

NotificationSchema.statics.findUnread = function(userId) {
  return this.find({ "user.id": userId, "viewed": false }).sort({ "timeStamp": -1 }).exec();
};

module.exports = mongoose.model('Notification', NotificationSchema);
