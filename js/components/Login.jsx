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
      error: false,
    };
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var email = this.refs.email.getDOMNode().value;
    var password = this.refs.password.getDOMNode().value;
    auth.logIn(email, password, function(loggedIn) {
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
      <div className="col-md-2 col-md-offset-10">
        <form onSubmit={this.handleSubmit}>
          <input type="text" ref="email" className="form-control" placeholder="Username"></input>
          <div className="input-group">
            <input type="password" ref="password" className="form-control" placeholder="Password"></input>
            <span className="input-group-btn">
              <button type="submit" className="btn btn-default">Login</button>
            </span>
          </div>
          {errors}
        </form>
      </div>
    );
  }
});

module.exports = Login;
