var assign = require('object-assign');
var Dispatcher = require('flux').Dispatcher;

var RepcoinConstants = require('../constants/RepcoinConstants.js');

var PayloadSources = RepcoinConstants.PayloadSources;

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
