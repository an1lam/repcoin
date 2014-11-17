"use strict";

var auth = require('../auth.jsx');
var LoggedInRoute = require('../mixins/LoggedInRoute.jsx');
var Login = require('./Login.jsx');
var React = require('react');
var Router = require('react-router');
var Signup = require('./Signup.jsx');
var Link = Router.Link;

var LoginPage = React.createClass({
  mixins: [LoggedInRoute],

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
        <div className="loginHeader row">
          <div>
          <button onClick={this.handleClick} type="button" ref="login" className="loginButton btn btn-default">Log In</button>
          {login}
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
