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
    return { error: false,
             msg: null
           };
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var firstname = this.refs.firstname.getDOMNode().value.trim();
    var lastname = this.refs.lastname.getDOMNode().value.trim();
    var email = this.refs.email.getDOMNode().value.trim();
    var email2 = this.refs.email2.getDOMNode().value.trim();
    var password = this.refs.password.getDOMNode().value;
    var password2 = this.refs.password2.getDOMNode().value;
    $(".pwd-field1").val('');
    $(".pwd-field2").val('');

    if (!firstname || !lastname || !email || !email2 || !password || !password2) {
      this.setState({ error: true, msg: 'Fields cannot be blank' });
      return;
    }

    if (email !== email2) {
      this.setState({ error: true, msg: 'Emails do not match' });
      return;
    }
    if (password !== password2) {
      this.setState({ error: true, msg: 'Passwords do not match' });
      return;
    }

    this.setState({ error: false, msg: 'Validating...' });
    var data = {
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: password
    };
    $.ajax({
      url: '/api/users',
      type: 'POST',
      data: data,
      success: function() {
        this.setState({ error: false, msg: 'Verification email sent!' });
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseText !== 'Error') {
          this.setState({ error: true, msg: xhr.responseText });
        }
        console.error(xhr.responseText);
      }.bind(this)
    });
  },

  render: function() {
    var msg = '';
    if (this.state.msg) {
      var clazz = this.state.error ? 'alert alert-danger' : 'alert alert-info';
      var msg = <div className={clazz} role="alert">
        <p>{this.state.msg}</p></div>;
    }
    return (
      <div className="signup col-md-2 col-md-offset-5">
        {msg}
        <form onSubmit={this.handleSubmit}>
          <input type="text" ref="firstname" className="form-control" placeholder="First name"></input>
          <input type="text" ref="lastname" className="form-control" placeholder="Last name"></input>
          <input type="text" ref="email" className="form-control" placeholder="Email"></input>
          <input type="text" ref="email2" className="form-control" placeholder="Re-enter email"></input>
          <input type="password" ref="password" className="pwd-field1 form-control" placeholder="Password"></input>
          <input type="password" ref="password2" className="pwd-field2 form-control" placeholder="Re-enter password"></input>
          <button type="submit" className="signupSubmit btn btn-default">Sign Up</button>
        </form>
      </div>
    );
  }
});

module.exports = Signup;
