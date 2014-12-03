'use strict';
var whitelist = require('./whitelist.js');

// Express middleware to check for acl privileges based on a whitelist
var acl = {
 
  // Check if the user has admin privileges
  isAdmin: function(req, res, next) {
    var userId = req.session.passport.user;
    if (whitelist[userId]) {
      next();
    } else {
      return res.status(403).send(userId + ' needs admin privileges');
    }
  },

  // Check if the user is an admin or the user being changed
  isAdminOrSelf: function(req, res, next) {
    var paramId = req.params.user_id;
    var userId = req.session.passport.user;
    if (whitelist[userId] || (paramId === userId)) {
      next();
    } else {
      return res.status(403).send(userId + 'does not have sufficient privileges');
    }
  },

  // Check if the user making a transaction is from or admin
  isAdminOrFrom: function(req, res, next) {
    if (!req.body.from) {
      return res.status(412).send('Invalid parameters to make transaction');
    } 
    var fromId = req.body.from.id;
    var userId = req.session.passport.user;
    if (whitelist[userId] || (fromId === userId)) {
      next();
    } else {
      return res.status(403).send(userId + 'does not have sufficient privileges');
    }
  }
};

module.exports = acl;
