var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var RepcoinAppDispatcher = require('../dispatcher/RepcoinAppDispatcher');
var RepcoinConstants = require('../constants/RepcoinConstants');

var ActionTypes = RepcoinConstants.ActionTypes;

var CHANGE = 'change';

var _viewedUser = null;
var _investors = {};

var UserStore = assign({}, EventEmitter.prototype, {
  emitChange: function() {
    this.emit(CHANGE);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE, callback);
  },

  getViewedUser: function() {
    return _viewedUser;
  },

  getInvestors: function(category) {
    return _investors;
  }
});

RepcoinAppDispatcher.register(function(payload) {
  var action = payload.action;

  switch (action.type) {
    case ActionTypes.RECEIVE_VIEWED_USER:
      _viewedUser = action.user;
      UserStore.emitChange();
      break;

    case ActionTypes.CATEGORY_DELETED:
      _viewedUser = action.user;
      UserStore.emitChange();
      break;

    case ActionTypes.CATEGORY_ADDED:
      _viewedUser = action.user;
      UserStore.emitChange();
      break;

    case ActionTypes.RECEIVE_INVESTORS:
      _investors[action.category] = action.investors;
      UserStore.emitChange();
      break;

    // do nothing
    default:
      break;
  }
});

module.exports = UserStore;
