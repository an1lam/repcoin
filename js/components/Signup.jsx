'use strict';
var $ = require('jquery');
var auth = require('../auth.jsx');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute');
var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;


var Signup = React.createClass({
  mixins: [Navigation],

  componentDidMount: function() {
    // Configure to work with localhost or repcoin.net
    if (document.domain === 'localhost') {
      var appId = '898342783518783';
    } else {
      var appId = '894010190618709';
    }
    window.fbAsyncInit = function() {
      FB.init({
        appId      : appId,
        cookie     : true,  // enable cookies to allow the server to access
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.1' // use version 2.1
      });

      // Now that we've initialized the JavaScript SDK, we call
      // FB.getLoginStatus().  This function gets the state of the
      // person visiting this page and can return one of three states to
      // the callback you provide.  They can be:
      //
      // 1. Logged into your app ('connected')
      // 2. Logged into Facebook, but not your app ('not_authorized')
      // 3. Not logged into Facebook and can't tell if they are logged into
      //    your app or not.
      //
      // These three cases are handled in the callback function.
      FB.getLoginStatus(function(response) {
        this.statusChangeCallback(response);
      }.bind(this));
    }.bind(this);

    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  },

  // Here we run a very simple test of the Graph API after login is
  // successful.  See statusChangeCallback() for when this call is made.
  testAPI: function() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Successful login for: ' + response.name);
      document.getElementById('status').innerHTML =
        'Thanks for logging in, ' + response.name + '!';
    });
  },

  // This is called with the results from from FB.getLoginStatus().
  statusChangeCallback: function(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      this.testAPI();
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into Facebook.';
    }
  },

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  checkLoginState: function() {
    FB.getLoginStatus(function(response) {
      this.statusChangeCallback(response);
    }.bind(this));
  },

  getInitialState: function() {
    return { error: false,
             msg: null
           };
  },

  handleClick: function(e) {
    e.preventDefault();
    FB.login(this.checkLoginState());
  },

  handleLogoutClick: function(e) {
    e.preventDefault();
    FB.logout(function(response) {
      console.log(response);
    }.bind(this));
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var firstname = this.refs.firstname.getDOMNode().value.trim();
    var lastname = this.refs.lastname.getDOMNode().value.trim();
    var email = this.refs.email.getDOMNode().value.trim();
    var email2 = this.refs.email2.getDOMNode().value.trim();
    var phoneNumber = this.refs.phoneNumber.getDOMNode().value.trim();
    var password = this.refs.password.getDOMNode().value;
    var password2 = this.refs.password2.getDOMNode().value;
    $(".pwd-field1").val('');
    $(".pwd-field2").val('');

    if (!firstname || !lastname || !email || !email2 || !phoneNumber
      || !password || !password2) {
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
      phoneNumber: phoneNumber,
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
        <div id="fb-root"></div>
        <a href="#" onClick={this.handleClick}>Login</a>
        <a href="#" onClick={this.handleLogoutClick}>Logout</a>
        <div id="status"></div>
        {verification}
        {error}
        {msg}
        <form onSubmit={this.handleSubmit}>
          <input type="text" ref="firstname" className="form-control" placeholder="First name"></input>
          <input type="text" ref="lastname" className="form-control" placeholder="Last name"></input>
          <input type="text" ref="email" className="form-control" placeholder="Email"></input>
          <input type="text" ref="email2" className="form-control" placeholder="Re-enter email"></input>
          <input type="text" ref="phoneNumber" className="form-control" placeholder="Phone number"></input>
          <input type="password" ref="password" className="pwd-field1 form-control" placeholder="Password"></input>
          <input type="password" ref="password2" className="pwd-field2 form-control" placeholder="Re-enter password"></input>
          <button type="submit" className="signupSubmit btn btn-default">Sign Up</button>
        </form>
      </div>
    );
  }
});

module.exports = Signup;
