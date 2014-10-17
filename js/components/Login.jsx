/** @jsx React.DOM */
"use strict";

var React = require('react');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute');
var Router = require('react-router');
var auth = require('../auth.jsx');

var TestMixin = {

};
var Login = React.createClass({
  getInitialState: function() {
    return {
      error: false
    };
  },
  handleSubmit: function(event) {
    event.preventDefault();
    var email = this.refs.email.getDOMNode().value;
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
    var errors = this.state.error ? <div className="alert alert-danger" role="alert"><strong>Invalid login credentials.</strong></div> : '';
    return (
      <div className="col-md-4 col-md-offset-4 login">
        <form onSubmit={this.handleSubmit} >
          <input type="text" ref="email" className="loginControl form-control" placeholder="Username"></input>
          <input type="password" ref="pass" className="loginControl form-control" placeholder="Password"></input>
          <button type="submit" className="loginSubmit btn btn-default">Login</button>

          {errors}
        </form>
      </div>
    );
  }
});

module.exports = Login;
