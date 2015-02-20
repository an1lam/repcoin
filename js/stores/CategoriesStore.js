var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var strings = require('../lib/strings_utils.js');
var RepcoinAppDispatcher = require('../dispatcher/RepcoinAppDispatcher');
var RepcoinConstants = require('../constants/RepcoinConstants');

var ActionTypes = RepcoinConstants.ActionTypes;

var CHANGE_EVENT = 'change';

var _categories = [];

var CategoriesStore = assign({}, EventEmitter.prototype, {

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  getAll: function() {
    return _categories;
  },

  sortCategories: function(selected) {
    var comparator;
    switch(selected) {
      case strings.ALPHABETICAL:
        comparator = _getAlphabeticalComparator();
        break;
      case strings.MARKET_SIZE_HIGH_TO_LOW:
        comparator = _getMarketComparator(true);
        break;
      case strings.MARKET_SIZE_LOW_TO_HIGH:
        comparator = _getMarketComparator(false);
        break;
      case strings.EXPERTS_HIGH_TO_LOW:
        comparator = _getExpertComparator();
        break;

      case strings.INVESTORS_HIGH_TO_LOW:
        comparator = _getInvestorComparator();
        break;

      default:
        comparator = _getAlphabeticalComparator();
        break;
    }

    _categories.sort(comparator);
  },



});

function _getExpertComparator() {
  return function(a, b) {
    if (a.experts > b.experts) {
      return -1;
    }
    if (a.experts < b.experts) {
      return 1;
    }
    return 0;
  }
}

function _getInvestorComparator() {
  return function(a, b) {
    if (a.investors > b.investors) {
      return -1;
    }
    if (a.investors < b.investors) {
      return 1;
    }
    return 0;
  }
}

function _getAlphabeticalComparator() {
  return function(a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }
}

function _getMarketComparator(high) {
  return function(a, b) {
    if (high) {
      return b.reps - a.reps;
    }
    return a.reps - b.reps;
  }
}

CategoriesStore.dispatchToken = RepcoinAppDispatcher.register(function(payload) {
  var action = payload.action;
  switch(action.type) {
    case ActionTypes.RECEIVE_CATEGORIES:
      _categories = action.categories;
      CategoriesStore.emitChange();
      break;
    case ActionTypes.SORT_CATEGORIES:
      CategoriesStore.sortCategories(action.selected);
      CategoriesStore.emitChange();
    default:
    // do nothing
  }
});

module.exports = CategoriesStore;
