var keyMirror = require('keymirror');

module.exports = {
  ActionTypes: keyMirror({
    GET_CATEGORIES: null,
    RECEIVE_CATEGORIES: null,
    GET_CURRENT_USER: null,
    RECEIVE_CURRENT_USER: null,
    GET_LOGGED_IN: null,
    RECEIVE_LOGGED_IN: null,
    GET_NOTIFICATIONS: null,
    RECEIVE_NOTIFICATIONS: null,
    RECEIVE_NOTIFICATIONS_READ: null,
    SET_NOTIFICATIONS_READ: null,
    TOGGLE_NOTIFICATIONS_DISPLAY: null,
    RECEIVE_TOTAL_TRADED: null,
    TOGGLE_SHOW_LOGIN: null,
    SIGN_UP_USER: null,
    SIGN_UP_FAILED: null,
    VERIFICATION_EMAIL_SENT: null,
    FORGOT_PASSWORD: null,
    LOGIN_FAILED: null,
    RECEIVE_CURRENT_USER_AND_LOGIN: null,
    SEND_PASSWORD_RESET_EMAIL: null,
    PASSWORD_RESET_EMAIL_SENT: null,
    PASSWORD_RESET_EMAIL_FAILED: null,
  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })
};
