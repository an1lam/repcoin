/** @jsx React.DOM */
"use strict";

var React = require('react');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute');
var Router = require('react-router');
var auth = require('../auth.jsx');
var $ = require('jquery');

var Signup = React.createClass({
  getInitialState: function() {
    return {};
  },

  handleSubmit: function() {
    var username = this.refs.username.getDOMNode().value;
    var email = this.refs.email.getDOMNode().value;
    var phoneNumber = this.refs.phoneNumber.getDOMNode().value;
    var password = this.refs.password.getDOMNode().value;
    var data = { username: username, email: email, phoneNumber: phoneNumber, password: password };
   
    $.ajax({
      url: '/api/users',
      type: 'POST',
      data: data,
      success: function() {
        Router.transitionTo('/home');
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    return (
      <div className="signup col-md-2 col-md-offset-5">
        <form onSubmit={this.handleSubmit}>
          <input type="text" ref="username" className="form-control" placeholder="Username"></input>
          <input type="text" ref="email" className="form-control" placeholder="Email"></input>
          <input type="text" ref="phoneNumber" className="form-control" placeholder="Phone Number"></input>
          <input type="password" ref="password" className="form-control" placeholder="Password"></input>
          <button type="submit" className="signupSubmit btn btn-default">Sign Up</button>
        </form>
      </div>
    );
  }
});

module.exports = Signup;
