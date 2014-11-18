"use strict";

var React = require('react');
var auth = require('../auth.jsx');
var Router = require('react-router');
var Navigation = Router.Navigation;

var Logout = React.createClass({
  mixins: [Navigation],

  handleClick: function() {
    auth.logOut(function(err) {
      if (err) {
        console.error("Error logging out user");
      }
      this.transitionTo("/");
    }.bind(this));
  },
  render: function() {
    return (
      <button type="submit" className="loginSubmit btn btn-default" onClick={this.handleClick}>Log Out</button>
    );
  }
});

module.exports = Logout;
