"use strict";

var auth = require('../auth.jsx');
var InstantBox = require('./InstantBox.jsx');
var Logout = require('./Logout.jsx');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Toolbar = React.createClass({
  getInitialState: function() {
    return {
      loggedIn: false,
      currentUser: null
    };
  },

  componentDidMount: function() {
    this.setState({ loggedIn: auth.loggedIn() });
    auth.getCurrentUser(function(user) {
      this.setState({ currentUser: user });
    }.bind(this));
  },

  render: function() {
    var LogoutOrNothing = this.state.loggedIn ? <div className="logoutbtn"><Logout /></div> : "";
    var profileLink = this.state.currentUser ? 
      <div className="profilelink"><Link to="profile" params={{userId: this.state.currentUser._id}}>{this.state.currentUser.firstname}</Link></div> : '';
    return (
      <div className="toolbar navbar navbar-default" role="navigation">
        <div className="navbar-header">
          <div className="homelink navbar-brand">
            <Link to="home">Repcoin</Link>
          </div>
        </div>
        <div className="col-md-3 col-md-offset-1">
          <InstantBox />
        </div>
        <div className="navbar navbar-right">
          <div className="navbar-header navbar-brand">
            {profileLink}
            {LogoutOrNothing}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Toolbar;
