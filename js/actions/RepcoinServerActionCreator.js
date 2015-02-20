var RepcoinAppDispatcher = require('../dispatcher/RepcoinAppDispatcher.js');
var RepcoinConstants = require('../constants/RepcoinConstants.js');

var ActionTypes = RepcoinConstants.ActionTypes;

module.exports = {
  receiveCategories: function(categories) {
    RepcoinAppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_CATEGORIES,
      categories: categories
    });
  }
};
