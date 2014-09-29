/** @jsx React.DOM */
"use strict";

var React = require('react');
var Login = require('./Login.jsx');
var Router = require('react-router');
var Link = Router.Link;

var LoginPage = React.createClass({
  render: function() {
    return (
      <div className="loginPage">
        <div className="loginHeader">
          <Link to="home">Feed</Link>
        </div>
        <div className="loginBody">
          <span className="logo">Reps</span>
          <span className="slogan">
            <h1>Reputation for the digital age</h1>
          </span>
          <Login />
        </div>
      </div>
    );
  }
});

module.exports = LoginPage;
