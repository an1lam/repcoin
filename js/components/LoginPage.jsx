'use strict';
var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var auth = require('../auth.jsx');
var Footer = require('./Footer.jsx');
var LoggedInRoute = require('../mixins/LoggedInRoute.jsx');
var Login = require('./Login.jsx');
var Signup = require('./Signup.jsx');
var strings = require('../lib/strings_utils.js');

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

  handleLoginClick: function() {
    this.setState({
      showLogin: !this.state.showLogin,
    });
  },

  render: function() {
    var login = this.state.showLogin ? <Login /> : '';
    var signUp;
    if (this.props.params.hash && this.props.params.email) {
      signUp = <Signup email={this.props.params.email}
                    hash={this.props.params.hash} />
    } else {
      signUp = <Signup />
    }

    return (
      <div className="loginPage">
        <div className="loginBody">
          <div className="login-form">
            <button onClick={this.handleLoginClick} type="button" ref="login" className="loginButton btn btn-default">Log In</button><br />
            <div className='login-wrapper'>
              {login}
            </div>
          </div>
          <div className="row">
            <div className="logo"><img src="http://res.cloudinary.com/repcoin/image/upload/v1423513285/2RepCoinHeader_mwyh9z.png"></img></div>
          </div>
          <span className="slogan">
            <h1>Coming to you February 12, 2015</h1>
          </span>
          <div className="signup-form">
            {signUp}
          </div>
        </div>
        <div className="row footerrow">
          <Footer />
        </div>
      </div>
    );
  }
});

module.exports = LoginPage;
