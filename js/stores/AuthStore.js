var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var strings = require('../lib/strings_utils.js');
var RepcoinAppDispatcher = require('../dispatcher/RepcoinAppDispatcher');
var RepcoinConstants = require('../constants/RepcoinConstants');

var ActionTypes = RepcoinConstants.ActionTypes;

var CURRENT_USER_CHANGE = 'current_user';
var LOGGED_IN_CHANGE = 'logged_in';

var _currentUser = null;
var _loggedIn = false;

var AuthStore = assign({}, EventEmitter.prototype, {

  // Note that we emit multiple change events for this store
  // because components might want to listen on different events
  emitCurrentUserChange: function() {
    this.emit(CURRENT_USER_CHANGE);
  },

  emitLoggedInChange: function() {
    this.emit(LOGGED_IN_CHANGE);
  },

  addCurrentUserListener: function(callback) {
    this.on(CURRENT_USER_CHANGE, callback);
  },

  removeCurrentUserListener: function(callback) {
    this.removeListener(CURRENT_USER_CHANGE, callback);
  },

  addLoggedInListener: function(callback) {
    this.on(LOGGED_IN_CHANGE, callback);
  },

  removeLoggedInListener: function(callback) {
    this.removeListener(LOGGED_IN_CHANGE, callback);
  },

  getCurrentUser: function() {
    return _currentUser;
  },

  getLoggedIn: function() {
    return _loggedIn;
  }
});

AuthStore.dispatchToken = RepcoinAppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    // Set our current user
    case ActionTypes.RECEIVE_CURRENT_USER_AND_NOTIFICATIONS:
      _currentUser = action.user;
      AuthStore.emitCurrentUserChange();
      break;


    // Let listeners know we're logged in
    case ActionTypes.RECEIVE_LOGGED_IN:
      _loggedIn = action.loggedIn;
      AuthStore.emitLoggedInChange();
      break;

    default:
      // do nothing

  }
});

module.exports = AuthStore;
