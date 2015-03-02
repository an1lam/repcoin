var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var strings = require('../lib/strings_utils.js');
var RepcoinAppDispatcher = require('../dispatcher/RepcoinAppDispatcher');
var RepcoinConstants = require('../constants/RepcoinConstants');

var ActionTypes = RepcoinConstants.ActionTypes;

var CHANGE_EVENT = 'change';
var TOTAL_TRADED_CHANGE_EVENT = 'total_traded_change';

var _hotCategoriesAndUsers = [];
var _categories = [];
var _totalTraded = null;

/* This will be the canonical example of a store.
   Besides 'sortCategories', all the functions in this store
   will likely exist in all of the stores we create.
*/
var CategoriesStore = assign({}, EventEmitter.prototype, {

  /* Emits an event on which views can base their update cycle.
     This function will typically get called, causing views to call
     whatever 'callback' function they've registered using 'addChangeListener'
  */
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  emitTotalTradedChange: function() {
    this.emit(TOTAL_TRADED_CHANGE_EVENT);
  },

  /* Function for registering view's change handlers */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /* Typically gets called in 'componentWillUnmount' in views */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  addTotalTradedChangeListener: function(callback) {
    this.on(TOTAL_TRADED_CHANGE_EVENT, callback);
  },

  removeTotalTradedChangeListener: function(callback) {
    this.removeListener(TOTAL_TRADED_CHANGE_EVENT, callback);
  },

  /* Returns all of the categories.
     This function is called both by the 'CategoriesPage' when it mounts
     and is triggered by Actions passed to this store through the Dispatcher
  */
  getAll: function() {
    return _categories;
  },

  getTotalTraded: function() {
    if (_totalTraded) {
      return _totalTraded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
      return '';
    }
  },

  getHot: function() {
    return _hotCategoriesAndUsers;
  },

  /* Sorts our '_categories' variable which will then be used to update
     the 'CategoriesPage'
  */
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
  }
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

/* Registers a callback on the Dispatcher. Basically, whatever function we call
   'register' on will get called whenever we trigger on the Dispatcher.

   We then update the store and views depending on its changes if the Action's
   type matches a type which affects our data.
*/
CategoriesStore.dispatchToken = RepcoinAppDispatcher.register(function(payload) {
  var action = payload.action;
  switch(action.type) {

    case ActionTypes.HOT_CATEGORIES_AND_USERS:
      _hotCategoriesAndUsers = action.categories;
      CategoriesStore.emitChange();
      break;

    // Received categories from the server
    case ActionTypes.RECEIVE_CATEGORIES:
      _categories = action.categories;
      CategoriesStore.emitChange();
      break;

    // 'CategoriesPage' wants the categories sorted
    case ActionTypes.SORT_CATEGORIES:
      CategoriesStore.sortCategories(action.selected);
      CategoriesStore.emitChange();

    case ActionTypes.RECEIVE_TOTAL_TRADED:
      _totalTraded = action.totalTraded;
      CategoriesStore.emitTotalTradedChange();
    default:
      // do nothing
  }
});

module.exports = CategoriesStore;
