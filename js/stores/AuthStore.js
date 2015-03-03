var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var strings = require('../lib/strings_utils.js');
var RepcoinAppDispatcher = require('../dispatcher/RepcoinAppDispatcher');
var RepcoinConstants = require('../constants/RepcoinConstants');

var ActionTypes = RepcoinConstants.ActionTypes;

var CURRENT_USER_CHANGE = 'current_user';
var LOGGED_IN_CHANGE = 'logged_in';
var STATUS_CHANGE = 'status';

var _currentUser = null;
var _loggedIn = false;
var _passwordResetStatus = {error: false, msg: ''};
var _showLogin = false;
var _signUpStatus = {error: false, msg: ''};
var _loginStatus = {error: false, msg: ''};
var _forgotPassword = false;

var AuthStore = assign({}, EventEmitter.prototype, {

  // Note that we emit multiple change events for this store
  // because components might want to listen on different events
  emitCurrentUserChange: function() {
    this.emit(CURRENT_USER_CHANGE);
  },

  emitLoggedInChange: function() {
    this.emit(LOGGED_IN_CHANGE);
  },

  emitStatusChange: function() {
    this.emit(STATUS_CHANGE);
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

  addStatusListener: function(callback) {
    this.on(STATUS_CHANGE, callback);
  },

  removeStatusListener: function(callback) {
    this.removeListener(STATUS_CHANGE, callback);
  },

  getCurrentUser: function() {
    return _currentUser;
  },

  getForgotPassword: function() {
    return _forgotPassword;
  },

  getLoggedIn: function() {
    return _loggedIn;
  },

  getShowLogin: function() {
    return _showLogin;
  },

  getSignUpStatus: function() {
    return _signUpStatus.msg;
  },

  getSignUpError: function() {
    return _signUpStatus.error;
  },

  getLoginStatus: function() {
    return _loginStatus.msg;
  },

  getLoginError: function() {
    return _loginStatus.error;
  },

  getPasswordResetStatus: function() {
    return _passwordResetStatus.msg;
  },

  getPasswordResetError: function() {
    return _passwordResetStatus.error;
  },

  isNewby: function() {
    if (_currentUser && _currentUser.portfolio.length < 1) {
      return true;
    } else {
      return false;
    }
  },

  toggleShowLogin: function() {
    _showLogin = !_showLogin;
  }
});

AuthStore.dispatchToken = RepcoinAppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {
    case ActionTypes.FORGOT_PASSWORD:
      _forgotPassword = true;
      AuthStore.emitStatusChange();
      break;

    case ActionTypes.LOGIN_FAILED:
      _loginStatus.msg = action.error;
      _loginStatus.error = true;
      AuthStore.emitStatusChange();
      break;

    case ActionTypes.PASSWORD_RESET_EMAIL_SENT:
      _passwordResetStatus.msg = strings.EMAIL_SENT(action.email);
      _passwordResetStatus.error = false;
      AuthStore.emitStatusChange();
      break;

    case ActionTypes.PASSWORD_RESET_EMAIL_FAILED:
      _passwordResetStatus.msg = action.msg;
      _passwordResetStatus.error = true;
      AuthStore.emitStatusChange();
      break;

    // Set our current user
    case ActionTypes.RECEIVE_CURRENT_USER_AND_NOTIFICATIONS:
      _currentUser = action.user;
      AuthStore.emitCurrentUserChange();
      break;

    case ActionTypes.RECEIVE_CURRENT_USER_AND_LOGIN:
      _currentUser = action.user;
      _loggedIn = true;
      AuthStore.emitCurrentUserChange();
      break;

    // Let listeners know we're logged in
    case ActionTypes.RECEIVE_LOGGED_IN:
      _loggedIn = action.loggedIn;
      AuthStore.emitLoggedInChange();
      break;

    case ActionTypes.SIGN_UP_USER:
      _signUpStatus.msg = strings.VALIDATING;
      _signUpStatus.error = false;
      AuthStore.emitStatusChange();
      break;

    case ActionTypes.SIGN_UP_FAILED:
      _signUpStatus.msg = action.error;
      _signUpStatus.error = true;
      AuthStore.emitStatusChange();
      break;

    case ActionTypes.TOGGLE_SHOW_LOGIN:
      AuthStore.toggleShowLogin();
      AuthStore.emitStatusChange();
      break;

    case ActionTypes.VERIFICATION_EMAIL_SENT:
      _signUpStatus.msg = strings.VERIFICATION_EMAIL_SENT;
      _signUpStatus.error = false;
      AuthStore.emitStatusChange();
      break;

    default:
      // do nothing

  }
});

module.exports = AuthStore;
