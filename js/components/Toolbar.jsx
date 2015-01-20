'use strict';

var $ = require('jquery');
var auth = require('../auth.jsx');
var InstantBox = require('./InstantBox.jsx');
var Logout = require('./Logout.jsx');
var NotificationDisplay = require('./NotificationDisplay.jsx');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Toolbar = React.createClass({
  getInitialState: function() {
    return {
      loggedIn: false,
      currentUser: null,
      notifications: [],
      showNotifications: false,
    };
  },

  componentDidMount: function() {
    auth.loggedIn(function(loggedIn) {
      this.setState({ loggedIn: loggedIn });
    }.bind(this));

    auth.getCurrentUser(function(user) {
      this.setState({ currentUser: user });
      if (user) {
        this.getNotifications(user);
      }
    }.bind(this));
  },

  toggleNotifications: function(e) {
    e.preventDefault();
    this.setState({ showNotifications: !this.state.showNotifications });
  },

  getNotifications: function(user) {
    var url = '/api/notifications/user/' + user._id + '/unread';
    $.ajax({
      url: url,
      success: function(notifications) {
        this.setState({ notifications: notifications });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
      }.bind(this)
    });
  },

  render: function() {
    var logout = this.state.loggedIn ? <div className="logoutbtn"><Logout /></div> : '';
    var instantBox = this.state.loggedIn ? <InstantBox /> : '';
    var profileLink = '';
    var notifications = '';
    if (this.state.currentUser) {
      profileLink =
        <div className="profilelink ">
          <Link to="profile" params={{userId: this.state.currentUser._id}}>{this.state.currentUser.firstname}</Link>
        </div>;
      var notificationTotal = '';
      var notificationLen = this.state.notifications.length;
      if (notificationLen !== 0) {
        notificationTotal = <span className="label label-primary label-as-badge">{notificationLen}</span>;
      }
      notifications =
        <a className="toolbar-notification" href="#" onClick={this.toggleNotifications}>
          <span className="glyphicon glyphicon-envelope" aria-hidden="true"></span>
          {notificationTotal}
        </a>;
      var notificationDisplay = this.state.showNotifications ? <NotificationDisplay notifications={this.state.notifications}/> : '';
    }
    return (
      <div className="toolbar navbar navbar-default" role="navigation">
        <div className="navbar-header">
          <div className="homelink  navbar-brand">
            <Link to="home">Repcoin</Link>
          </div>
        </div>
        <div className="col-md-3 col-md-offset-1 toolbar-search ">
          {instantBox}
        </div>
        <ul className="nav navbar-nav toolbar-nav-right">
          <li>{profileLink}</li>
          <li>
            {notifications}
            {notificationDisplay}
          </li>
          <li>{logout}</li>
        </ul>
      </div>
    );
  }
});

module.exports = Toolbar;
