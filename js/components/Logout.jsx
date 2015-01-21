"use strict";

var React = require('react');
var auth = require('../auth.jsx');
var Router = require('react-router');
var Navigation = Router.Navigation;
var strings = require('../lib/strings_utils.js');

var Logout = React.createClass({
  mixins: [Navigation],

  handleClick: function() {
    auth.logOut(function(err) {
      if (err) {
        console.error(strings.LOG_OUT_ERROR);
      }
      this.transitionTo("/");
    }.bind(this));
  },
  render: function() {
    return (
      <button type="submit" className="loginSubmit btn btn-default" onClick={this.handleClick}>{strings.LOG_OUT}</button>
    );
  }
});

module.exports = Logout;
