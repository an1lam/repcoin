'use strict';
var ComboHandler = require('../handlers/combo.js');
var Transaction = require('../models/Transaction.js');
var utils = require('./utils.js');

module.exports = function(router, isAuthenticated, acl) {
  router.get('/feedItems/:timeStamp', isAuthenticated, ComboHandler.feedItems.get);
};
