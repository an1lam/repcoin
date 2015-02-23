var $ = require('jquery');

var ServerActionCreator = require('./actions/RepcoinServerActionCreator.js');

module.exports = {
  getCategories: function() {
    $.ajax({
      url: '/api/categories',
      success: ServerActionCreator.receiveCategories,
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      },
    })
  },

  getCurrentUserAndNotifications: function() {
    $.ajax({
      url:  '/api/user',
      success: function(user) {
        var url = '/api/notifications/user/' + user._id + '/unread';
        $.ajax({
          url: url,
          success: function(notifications) {
            ServerActionCreator.receiveCurrentUserAndNotifications(
              user, notifications);
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(xhr.responseText);
          }.bind(this)
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
        ServerActionCreator.receiveCurrentUser(null);
      }.bind(this)
    });
  },

  getNotifications: function(userId) {
    var url = '/api/notifications/user/' + userId + '/unread';
    $.ajax({
      url: url,
      success: ServerActionCreator.receiveNotifications,
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
      }.bind(this)
    });
  },

  getCurrentUser: function() {
    $.ajax({
      url:  '/api/user',
      success: ServerActionCreator.receiveCurrentUser,
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
        ServerActionCreator.receiveCurrentUser(null);
      }.bind(this)
    });
  },

  getLoggedIn: function() {
    $.ajax({
      url:  '/api/loggedin',
      success: ServerActionCreator.receiveLoggedIn,
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
        ServerActionCreator.receiveLoggedIn(false);
      }.bind(this)
    });
  },

  setNotificationsRead: function(currentUserId, notificationIds) {
    console.log(notificationIds);
    var url = '/api/notifications/user/' + currentUserId + '/markread';
    var data = { notificationIds: notificationIds };
    $.ajax({
      url: url,
      type: 'PUT',
      data: data,
      success: ServerActionCreator.receiveNotificationsRead,
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
      }
    });
  }

}
