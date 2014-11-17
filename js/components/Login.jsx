"use strict";
var auth = require('../auth.jsx');
var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;

var Login = React.createClass({
  mixins: [Navigation],

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
        this.transitionTo('/home');
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
          <input type="text" ref="email" className="form-control" placeholder="Email Address"></input>
          <div className="input-group">
            <input type="password" ref="password" className="form-control" placeholder="Password"></input>
            <span className="input-group-btn">
              <button type="submit" className="btn btn-default"><span className="glyphicon glyphicon-ok"></span></button>  
            </span>
          </div>
          {errors}
        </form>
      </div>
    );
  }
});

module.exports = Login;
