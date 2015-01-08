'use strict';

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
    auth.loggedIn(function(loggedIn) {
      this.setState({ loggedIn: loggedIn });
    }.bind(this));

    auth.getCurrentUser(function(user) {
      this.setState({ currentUser: user });
    }.bind(this));
  },

  render: function() {
    var logout = this.state.loggedIn ? <div className="logoutbtn"><Logout /></div> : '';
    var instantBox = this.state.loggedIn ? <InstantBox /> : '';
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
          {instantBox}
        </div>
        <div className="navbar navbar-right">
          <div className="navbar-header navbar-brand">
            {profileLink}
            {logout}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Toolbar;
