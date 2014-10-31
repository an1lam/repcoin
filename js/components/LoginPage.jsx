"use strict";

var React = require('react');
var Login = require('./Login.jsx');
var Router = require('react-router');
var Link = Router.Link;
var Signup = require('./Signup.jsx');

var LoginPage = React.createClass({

  getInitialState: function() {
    return {
      showLogin: false,
    };
  },

  handleClick: function() {
    this.setState({ showLogin: !this.state.showLogin });
  },

  render: function() {
    var login = this.state.showLogin ? <Login /> : '';
    return (
      <div className="loginPage">
        <div className="loginHeader">
          <div>
          <button onClick={this.handleClick} type="button" ref="login" className="loginButton btn btn-default">Log In</button>
          {login}
          </div>
        </div>
        <div className="loginBody">
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
