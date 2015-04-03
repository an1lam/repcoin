var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var api = require('../api.js');
var AuthStore = require('../stores/AuthStore.js');
var strings = require('../lib/strings_utils.js');
var RepcoinAppDispatcher = require('../dispatcher/RepcoinAppDispatcher');
var RepcoinConstants = require('../constants/RepcoinConstants');

var ActionTypes = RepcoinConstants.ActionTypes;

var CHANGE_EVENT = 'change';

var _notifications = [];
var _display = false;

var NotificationsStore = assign({}, EventEmitter.prototype, {
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  getAll: function() {
    return _notifications;
  },

  getAllIds: function() {
    var notificationIds = [];
    for (var i = 0; i < _notifications.length; i++) {
      notificationIds.push(_notifications[i]._id);
    }

    return notificationIds;
  },

  getDisplay: function() {
    return _display;
  },

  setAllRead: function() {
    _notifications = [];
  }
});

NotificationsStore.dispatchToken = RepcoinAppDispatcher.register(function(payload) {
  var action = payload.action;
  RepcoinAppDispatcher.waitFor([AuthStore.dispatchToken]);

  switch (action.type) {
    case ActionTypes.RECEIVE_CURRENT_USER_AND_NOTIFICATIONS:
      _notifications = action.notifications;
      NotificationsStore.emitChange();
      break;

    case ActionTypes.RECEIVE_NOTIFICATIONS_READ:
      NotificationsStore.setAllRead();
      NotificationsStore.emitChange();
      break;

    case ActionTypes.TOGGLE_NOTIFICATIONS_DISPLAY:
      _display = !_display;
      NotificationsStore.emitChange();
      break;

    case ActionTypes.RECEIVE_CURRENT_USER:
      if (!action.user) {
        _notifications = [];
        NotificationsStore.emitChange();
      }

    // do nothing
    default:
      break;
  }
});

module.exports = NotificationsStore;
