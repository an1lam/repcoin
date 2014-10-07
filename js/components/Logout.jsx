/** @jsx React.DOM */
"use strict";

var React = require('react');
var auth = require('../auth.jsx');
var Router = require('react-router');

var Logout = React.createClass({
  handleClick: function() {
    auth.logOut();
    Router.transitionTo("/");
  },
  render: function() {
    return (
      <button type="submit" className="loginSubmit btn btn-default" onClick={this.handleClick}>Log Out</button>
    );
  }
});

module.exports = Logout;
