'use strict';
var React = require('react');

var NotificationDisplay = React.createClass({
  getNotifications: function() {
    var notifications = [];
    for (var i = 0; i < this.props.notifications.length; i++) {
      var notification = this.props.notifications[i];
      notifications.push(
        <li className="list-group-item" key={i}>
          {notification.message}
        </li>
      );
    }
    return notifications;
  },

  render: function() {
    return (
      <div className="notificationDisplay">
        <ul className="list-group">
          {this.getNotifications()}
        </ul>
      </div>
    );
  }
});

module.exports = NotificationDisplay;
