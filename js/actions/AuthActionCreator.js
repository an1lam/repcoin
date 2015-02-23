var api = require('../api.js')
var RepcoinAppDispatcher = require('../dispatcher/RepcoinAppDispatcher.js');
var RepcoinConstants = require('../constants/RepcoinConstants.js');
var ActionTypes = RepcoinConstants.ActionTypes;

module.exports = {

  // This method gets both notifications and the current user
  // because it's the best way within the Flux architecture to
  // get notifications AFTER we get the current user
  getCurrentUserAndNotifications: function() {
    api.getCurrentUserAndNotifications();
  },

  getCurrentUser: function() {
    api.getCurrentUser();
  },

  getLoggedIn: function() {
    RepcoinAppDispatcher.handleViewAction({
      type: ActionTypes.GET_LOGGED_IN
    });

    api.getLoggedIn();
  },


};
