var RepcoinAppDispatcher = require('../dispatcher/RepcoinAppDispatcher.js');
var RepcoinConstants = require('../constants/RepcoinConstants.js');

var ActionTypes = RepcoinConstants.ActionTypes;

/* File for handling any actions created by 'api' */
module.exports = {

  /* Receive categories from our 'api' request and signal the Dispatcher
     to emit a RECEIVE_CATEGORIES event
  */
  receiveCategories: function(categories) {
    RepcoinAppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_CATEGORIES,
      categories: categories
    });
  }
};
