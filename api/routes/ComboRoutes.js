'use strict';
var ComboHandler = require('../handlers/combo.js');

module.exports = function(router) {
  router.get('/feedItems/:timeStamp', ComboHandler.feedItems.get);
};
