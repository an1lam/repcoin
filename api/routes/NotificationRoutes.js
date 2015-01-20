'use strict';

var NotificationHandler = require('../handlers/notification.js');

module.exports = function(router, isAuthenticated, acl) {
  router.get('/notifications/user/:user_id/unread', isAuthenticated, acl.isAdminOrSelf, NotificationHandler.user.userId.unread.get);
};
