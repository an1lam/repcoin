"use strict";

var auth = require('../auth.jsx');
var LoggedInRoute = require('../mixins/LoggedInRoute.jsx');
var Login = require('./Login.jsx');
var PasswordReset = require('./PasswordReset.jsx');
var React = require('react');
var Router = require('react-router');
var Signup = require('./Signup.jsx');
var Link = Router.Link;

var LoginPage = React.createClass({
  mixins: [LoggedInRoute],

  getInitialState: function() {
    return {
      showLogin: false,
      showPasswordReset: false,
    };
  },

  handleLoginClick: function() {
    this.setState({
      showPasswordReset: false,
      showLogin: !this.state.showLogin,
    });
  },

  handlePasswordResetClick: function() {
    this.setState({
      showLogin: false,
      showPasswordReset: !this.state.showPasswordReset,
    });
  },

  render: function() {
    var login = this.state.showLogin ? <Login /> : '';
    var passwordReset = this.state.showPasswordReset ? <PasswordReset /> : '';

    return (
      <div className="loginPage">
        <div className="loginHeader row">
          <div>
          <button onClick={this.handleLoginClick} type="button" ref="login" className="loginButton btn btn-default">Log In</button>
          <button onClick={this.handlePasswordResetClick}
            type="button" ref="passwordReset"
            className="passwordResetButton btn btn-default">
            Reset Password
          </button>
          {login}
          {passwordReset}
          </div>
        </div>
        <div className="loginBody row">
          <span className="logo">Repcoin</span>
          <span className="slogan">
            <h1>Find your expert.</h1>
          </span>
          <Signup />
        </div>
      </div>
    );
  }
});

module.exports = LoginPage;
