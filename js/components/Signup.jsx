/** @jsx React.DOM */
"use strict";

var React = require('react');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute');
var Router = require('react-router');
var auth = require('../auth.jsx');

var Signup = React.createClass({
  getInitialState: function() {
    return {
      error: false,
    };
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var username = this.refs.username.getDOMNode().value;
    var email = this.refs.email.getDOMNode().value;
    var phoneNumber = this.refs.phoneNumber.getDOMNode().value;
    var pass = this.refs.pass.getDOMNode().value;
    auth.logIn(email, pass, function(loggedIn) {
      if (loggedIn) {
        Router.transitionTo('/home');
      }
      else {
        return this.setState({error: true});
      }
    }.bind(this));
  },

  render: function() {
    return (
      <div className="signup">
        <form onSubmit={this.handleSubmit}>
          <input type="text" ref="username" className="form-control" placeholder="Username"></input>
          <input type="text" ref="email" className="form-control" placeholder="Email"></input>
          <input type="text" ref="phoneNumber" className="form-control" placeholder="Phone Number"></input>
          <input type="password" ref="pass" className="form-control" placeholder="Password"></input>
          <button type="submit" className="loginSubmit btn btn-default">Sign Up</button>
        </form>
      </div>
    );
  }
});

module.exports = Signup;
