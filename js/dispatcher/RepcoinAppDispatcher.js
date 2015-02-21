var assign = require('object-assign');
var Dispatcher = require('flux').Dispatcher;

var RepcoinConstants = require('../constants/RepcoinConstants.js');

var PayloadSources = RepcoinConstants.PayloadSources;

/* The Dispatcher's a singleton (so only one instance of it exists in the
   entire app) just like our Stores.

   The Dispatcher connects ActionCreators to Stores. ActionCreators pass
   Actions to the Dispatcher and the Dispatcher emits those actions
   to all the Stores. Different Stores act on different actions.
*/
var RepcoinAppDispatcher = assign(new Dispatcher(), {
  handleServerAction: function(action) {
    var payload = {
      source: PayloadSources.SERVER_ACTION,
      action: action,
    };

    this.dispatch(payload);
  },

  handleViewAction: function(action){
    var payload = {
      source: PayloadSources.VIEW_ACTION,
      action: action,
    };

    this.dispatch(payload);
  }

});

module.exports = RepcoinAppDispatcher;
