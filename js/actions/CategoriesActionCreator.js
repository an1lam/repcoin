var api = require('../api.js')
var RepcoinAppDispatcher = require('../dispatcher/RepcoinAppDispatcher.js');
var RepcoinConstants = require('../constants/RepcoinConstants.js');
var ActionTypes = RepcoinConstants.ActionTypes;

module.exports = {
  getCategories: function() {
    RepcoinAppDispatcher.handleViewAction({
      type: ActionTypes.GET_CATEGORIES
    });

    api.getCategories();
  },

  sortCategories: function(selected) {
    RepcoinAppDispatcher.handleViewAction({
      type: ActionTypes.SORT_CATEGORIES,
      selected: selected
    });
  },

  getTotalTraded: function() {
    RepcoinAppDispatcher.handleViewAction({
      type: ActionTypes.GET_TOTAL_TRADED
    });

    api.getTotalRepsTraded();
  },

  getSizes: function(categories, expert) {
    RepcoinAppDispatcher.handleViewAction({
      type: ActionTypes.GET_CATEGORY_SIZES
    });

    api.getCategorySizes(categories, expert);
  },

  getHotCategoriesAndUsers: function(categories, expert) {
    RepcoinAppDispatcher.handleViewAction({
      type: ActionTypes.GET_HOT_CATEGORIES_AND_USERS,
      categories: categories,
      expert: expert,
    });

    api.getHotCategoriesAndUsers();
  },
};
