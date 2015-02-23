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
  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })
};
