"use strict";
var $ = require('jquery');
var auth = require('../auth.jsx');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute');
var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;

var Signup = React.createClass({
  mixins: [Navigation],

  getInitialState: function() {
    return { error: null };
  },

  handleSubmit: function() {
    var firstname = this.refs.firstname.getDOMNode().value;
    var lastname = this.refs.lastname.getDOMNode().value;
    var email = this.refs.email.getDOMNode().value;
    var phoneNumber = this.refs.phoneNumber.getDOMNode().value;
    var password = this.refs.password.getDOMNode().value;
    var data = { firstname: firstname, lastname: lastname, email: email, phoneNumber: phoneNumber, password: password };
   
    $.ajax({
      url: '/api/users',
      type: 'POST',
      data: data,
      success: function() {
        this.transitionTo('/home');
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseText !== "Error") {
          this.setState({ error: xhr.responseText });
        }
        console.error(xhr.responseText);
      }.bind(this)
    });
  },

  render: function() {
    var error = this.state.error ? <div className="alert alert-danger" role="alert"><p>{this.state.error}</p></div> : '';
    return (
      <div className="signup col-md-2 col-md-offset-5">
        {error}
        <form onSubmit={this.handleSubmit}>
          <input type="text" ref="firstname" className="form-control" placeholder="First name"></input>
          <input type="text" ref="lastname" className="form-control" placeholder="Last name"></input>
          <input type="text" ref="email" className="form-control" placeholder="Email"></input>
          <input type="text" ref="phoneNumber" className="form-control" placeholder="Phone number"></input>
          <input type="password" ref="password" className="form-control" placeholder="Password"></input>
          <button type="submit" className="signupSubmit btn btn-default">Sign Up</button>
        </form>
      </div>
    );
  }
});

module.exports = Signup;
