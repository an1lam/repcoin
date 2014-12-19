'use strict';
var $ = require('jquery');
var auth = require('../auth.jsx');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute');
var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;

var Signup = React.createClass({
  mixins: [Navigation],

  getInitialState: function() {
    return { error: null,
             verification: null
           };
  },

  handleSubmit: function() {
    var firstname = this.refs.firstname.getDOMNode().value.trim();
    var lastname = this.refs.lastname.getDOMNode().value.trim();
    var email = this.refs.email.getDOMNode().value.trim();
    var email2 = this.refs.email2.getDOMNode().value.trim();
    var phoneNumber = this.refs.phoneNumber.getDOMNode().value.trim();
    var password = this.refs.password.getDOMNode().value;
    var password2 = this.refs.password2.getDOMNode().value;
    var data = { firstname: firstname, lastname: lastname, email: email, phoneNumber: phoneNumber, password: password };

    if (email !== email2) {
      this.setState({ error: 'Emails do not match' });
      return;
    }
    if (password !== password2) {
      this.setState({ error: 'Passwords do not match' });
      return;
    }

    $.ajax({
      url: '/api/users',
      type: 'POST',
      data: data,
      success: function() {
        this.setState({ error: null, verification: 'Verification email sent!' });
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseText !== 'Error') {
          this.setState({ error: xhr.responseText });
        }
        console.error(xhr.responseText);
      }.bind(this)
    });
  },

  render: function() {
    var verification = this.state.verification ? <div className="alert alert-success" role="alert">
      <p>{this.state.verification}</p></div> : '';
    var error = this.state.error ? <div className="alert alert-danger" role="alert">
      <p>{this.state.error}</p></div> : '';
    return (
      <div className="signup col-md-2 col-md-offset-5">
        {verification}
        {error}
        <form onSubmit={this.handleSubmit}>
          <input type="text" ref="firstname" className="form-control" placeholder="First name"></input>
          <input type="text" ref="lastname" className="form-control" placeholder="Last name"></input>
          <input type="text" ref="email" className="form-control" placeholder="Email"></input>
          <input type="text" ref="email2" className="form-control" placeholder="Re-enter email"></input>
          <input type="text" ref="phoneNumber" className="form-control" placeholder="Phone number"></input>
          <input type="password" ref="password" className="form-control" placeholder="Password"></input>
          <input type="password" ref="password2" className="form-control" placeholder="Re-enter password"></input>
          <button type="submit" className="signupSubmit btn btn-default">Sign Up</button>
        </form>
      </div>
    );
  }
});

module.exports = Signup;
