var RepcoinAppDispatcher = require('../dispatcher/RepcoinAppDispatcher.js');
var RepcoinConstants = require('../constants/RepcoinConstants.js');

var ActionTypes = RepcoinConstants.ActionTypes;

/* File for handling any actions created by 'api' */
module.exports = {

  /* Receive categories from our 'api' request and signal the Dispatcher
     to emit a RECEIVE_CATEGORIES event
  */
  receiveCategories: function(categories) {
    RepcoinAppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_CATEGORIES,
      categories: categories
    });
  },

  receiveCurrentUser: function(user) {
    RepcoinAppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_CURRENT_USER,
      user: user
    });
  },

  receiveLoggedIn: function(loggedIn) {
    RepcoinAppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_LOGGED_IN,
      loggedIn: loggedIn
    });
  },

  receiveCurrentUserAndNotifications: function(user, notifications) {
    RepcoinAppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_CURRENT_USER_AND_NOTIFICATIONS,
      user: user,
      notifications: notifications
    });
  },

  receiveNotifications: function(notifications) {
    RepcoinAppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_NOTIFICATIONS,
      notifications: notifications
    });
  },

  receiveNotificationsRead: function() {
    RepcoinAppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_NOTIFICATIONS_READ
    });
  },

  receiveTotalTraded: function(res) {
    RepcoinAppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_TOTAL_TRADED,
      totalTraded: res.total,
    });
  },

  verificationEmailSent: function() {
    RepcoinAppDispatcher.handleServerAction({
      type: ActionTypes.VERIFICATION_EMAIL_SENT,
    });
  },

  signUpFailed: function(msg) {
    RepcoinAppDispatcher.handleServerAction({
      type: ActionTypes.SIGN_UP_FAILED,
      error: msg
    })
  },

  receiveCurrentUserAndLogin: function(user) {
    RepcoinAppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_CURRENT_USER_AND_LOGIN,
      user: user
    })
  },

  loginFailed: function(msg) {
    RepcoinAppDispatcher.handleServerAction({
      type: ActionTypes.LOGIN_FAILED,
      error: msg
    })
  }



};
