var api = require('../api.js');
var AuthStore = require('../stores/AuthStore.js');
var NotificationsStore = require('../stores/NotificationsStore.js');
var RepcoinAppDispatcher = require('../dispatcher/RepcoinAppDispatcher.js');
var RepcoinConstants = require('../constants/RepcoinConstants.js');
var ActionTypes = RepcoinConstants.ActionTypes;

module.exports = {
  setNotificationsRead: function(currentUserId, notifications) {
    RepcoinAppDispatcher.handleViewAction({
      type: ActionTypes.SET_NOTIFICATIONS_READ
    });

    var notificationIds = NotificationsStore.getAllIds();
    var currentUserId = AuthStore.getCurrentUser()._id;
    if (currentUserId && notificationIds.length > 1) {
      api.setNotificationsRead(currentUserId, notificationIds);
    }
  },

  toggleNotificationsDisplay: function() {
    RepcoinAppDispatcher.handleViewAction({
      type: ActionTypes.TOGGLE_NOTIFICATIONS_DISPLAY
    });
  }
};
