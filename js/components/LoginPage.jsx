'use strict';

var auth = require('../auth.jsx');
var Footer = require('./Footer.jsx');
var LoggedInRoute = require('../mixins/LoggedInRoute.jsx');
var Login = require('./Login.jsx');
var React = require('react');
var Router = require('react-router');
var Signup = require('./Signup.jsx');
var Link = Router.Link;

var LoginPage = React.createClass({
  mixins: [ Router.Navigation ],

  getInitialState: function() {
    // Redirect to the home page if logged in
    auth.loggedIn(function(loggedIn) {
      if (loggedIn) {
        this.transitionTo('/home');
      }
    }.bind(this));

    return {
      showLogin: false,
    };
  },

  componentDidMount: function() {
    // Configure to work with localhost or repcoin.com
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
    };

    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  },

  handleLoginClick: function() {
    this.setState({
      showLogin: !this.state.showLogin,
    });
  },

  render: function() {
    var login = this.state.showLogin ? <Login /> : '';

    return (
      <div className="loginPage">
        <div className="loginBody row">
          <div>
            <button onClick={this.handleLoginClick} type="button" ref="login" className="loginButton btn btn-default">Log In</button>
            {login}
          </div>
          <span className="logo">Repcoin</span>
          <span className="slogan">
            <h1>Find your expert.</h1>
          </span>
          <Signup />
        </div>
        <div className="row footerrow">
          <Footer />
        </div>
      </div>
    );
  }
});

module.exports = LoginPage;
