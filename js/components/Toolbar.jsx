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

  componentWillMount: function() {
    AuthStore.addCurrentUserListener(this._onCurrentUserChange);
    AuthStore.addLoggedInListener(this._onLoggedInChange);
    NotificationsStore.addChangeListener(this._onNotificationsChange);
  },

  componentDidMount: function() {
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
    var logoutOrSignup;
    if (this.state.loggedIn) {
      logoutOrSignup = <div className="logoutbtn"><Logout /></div>;
    } else {
      logoutOrSignup = <div><Link className="sign-up-link" to="login">Sign Up</Link></div>;
    }

    var instantBox = <InstantBox />;
    var profileLink = '';
    var notifications = '';
    var categories = '';
    if (this.state.currentUser) {
      profileLink = <div className="profilelink">
        <Link to="profile" params={{userId: this.state.currentUser._id}}>
          {this.state.currentUser.firstname}
        </Link>
      </div>

      var notificationTotal = '';

      if (this.state.notifications) {
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
    }

    return (
      <div className="toolbar navbar navbar-default" role="navigation">
        <div className="navbar-header">
          <div className="homelink navbar-brand col-md-1">
            <Link to="home">{strings.REPCOIN}</Link>
          </div>
        </div>
        <div className="col-md-3 toolbar-search ">
          {instantBox}
        </div>
        <div className="toolbar-nav-right">
        <ul className="nav navbar-nav">
          <li>{profileLink}</li>
          <li>
            <div className="categories-link">
              <Link to="categories">Categories</Link>
            </div>
          </li>
          <li>{notifications}</li>
          <li>{logoutOrSignup}</li>
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
