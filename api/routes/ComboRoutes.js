'use strict';
var ComboHandler = require('../handlers/combo.js');
var Transaction = require('../models/Transaction.js');
var utils = require('./utils.js');
var winston = require('winston');

module.exports = function(router, isAuthenticated, acl) {
  router.get('/feedItems', isAuthenticated, ComboHandler.feedItems.get);
};
