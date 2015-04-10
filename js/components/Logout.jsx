"use strict";

var React = require('react');
var AuthActionCreator = require('../actions/AuthActionCreator.js');
var AuthStore = require('../stores/AuthStore.js');
var Router = require('react-router');
var Navigation = Router.Navigation;
var strings = require('../lib/strings_utils.js');

var Logout = React.createClass({
  mixins: [Navigation],

  componentDidMount: function() {
    AuthStore.addLoggedInListener(this._onChange);
  },

  componentWillUnmount: function() {
    AuthStore.removeLoggedInListener(this._onChange);
  },

  handleClick: function() {
    AuthActionCreator.logoutUser();
  },

  render: function() {
    return (
      <button type="submit" className="loginSubmit btn btn-default" onClick={this.handleClick}>{strings.LOG_OUT}</button>
    );
  },

  _onChange: function() {
    if (!AuthStore.getLoggedIn()) {
      this.transitionTo('/');
    }
  },

});

module.exports = Logout;
