'use strict';

var $ = require('jquery');
var auth = require('../auth.jsx');
var AuthStore = require('../stores/AuthStore.js');
var AuthActionCreator = require('../actions/AuthActionCreator.js');
var InstantBox = require('./InstantBox.jsx');
var Logout = require('./Logout.jsx');
var NotificationDisplay = require('./NotificationDisplay.jsx');
var NotificationsActionCreator = require('../actions/NotificationsActionCreator.js');
var NotificationsStore = require('../stores/NotificationsStore.js');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var strings = require('../lib/strings_utils.js');

function getStateFromStores() {
  return {
    loggedIn: AuthStore.getLoggedIn(),
    currentUser: AuthStore.getCurrentUser(),
    notifications: NotificationsStore.getAll(),
    showNotifications: NotificationsStore.getDisplay()
  }
}


var Toolbar = React.createClass({
  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    AuthStore.addCurrentUserListener(this._onCurrentUserChange);
    AuthStore.addLoggedInListener(this._onLoggedInChange);
    NotificationsStore.addChangeListener(this._onNotificationsChange);
    AuthActionCreator.getLoggedIn();
    AuthActionCreator.getCurrentUserAndNotifications();
  },

  componentWillUnmount: function() {
    NotificationsStore.removeChangeListener(this._onNotificationsChange);
    AuthStore.removeCurrentUserListener(this._onCurrentUserChange);
    AuthStore.removeLoggedInListener(this._onLoggedInChange);
  },

  toggleNotifications: function(e) {
    e.preventDefault();
    if (this.state.showNotifications) {
      NotificationsActionCreator.setNotificationsRead();
    }

    NotificationsActionCreator.toggleNotificationsDisplay();
  },

  render: function() {
    var logout = this.state.loggedIn ? <div className="logoutbtn"><Logout /></div> : '';
    var instantBox = this.state.loggedIn ? <InstantBox /> : '';
    var profileLink = '';
    var notifications = '';
    var categories = '';
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
      var categories = (
        <div className="categories-link">
          <Link to="categories">Categories</Link>
        </div>
      );
    }
    return (
      <div className="toolbar navbar navbar-default" role="navigation">
        <div className="navbar-header">
          <div className="homelink navbar-brand">
            <Link to="home">{strings.REPCOIN}</Link>
          </div>
        </div>
        <div className="col-md-3 col-md-offset-1 toolbar-search ">
          {instantBox}
        </div>
        <div className="toolbar-nav-right">
        <ul className="nav navbar-nav toolbar-nav-right">
          <li>{profileLink}</li>
          <li>{categories}</li>
          <li>
            {notifications}
          </li>
          <li>{logout}</li>
        </ul>
          {notificationDisplay}
        </div>
      </div>
    );
  },

  _onCurrentUserChange: function() {
    this.setState(getStateFromStores());
  },

  _onLoggedInChange: function() {
    this.setState(getStateFromStores());
  },

  _onNotificationsChange: function() {
    this.setState(getStateFromStores());
  },
});

module.exports = Toolbar;
