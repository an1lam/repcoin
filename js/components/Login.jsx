'use strict';
var auth = require('../auth.jsx');
var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;
var PasswordReset = require('./PasswordReset.jsx');

var Login = React.createClass({
  mixins: [Navigation],

  getInitialState: function() {
    return {
      error: false,
      forgotPassword: false
    };
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var email = this.refs.email.getDOMNode().value;
    var password = this.refs.password.getDOMNode().value;
    $(".login-pwd").val('');
    auth.logIn(email, password, function(loggedIn) {
      if (loggedIn) {
        this.transitionTo('/home');
      } else {
        return this.setState({error: true});
      }
    }.bind(this));
  },

  handleForgotPasswordClick: function(e) {
    e.preventDefault();
    this.setState({ forgotPassword: true });
  },

  handleFacebookClick: function(e) {
    e.preventDefault();
    FB.getLoginStatus(this.statusCallback);
  },

  statusCallback: function(response) {
    if (response.status === 'connected') {
      this.loginUser(response.authResponse.accessToken);
    } else {
      FB.login(this.loginCallback, true);
    }
  },

  loginCallback: function(response) {
    if (response.status === 'connected') {
      this.loginUser(response.authResponse.accessToken);
      } else if (response.status === 'not_authorized') {
      this.setState({ error: true, msg: 'Unauthorized credentials for facebook login' });
    } else {
      this.setState({ error: true, msg: 'Error logging into facebook' });
    }
  },

  loginUser: function(accessToken) {
    $.ajax({
      url: '/api/login/facebook',
      type: 'POST',
      data: { access_token: accessToken },
      success: function(user) {
        auth.storeCurrentUser(user, function() {
          this.transitionTo('/home');
        }.bind(this));
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
    var errors = this.state.error ? <div className="alert alert-danger" role="alert"><strong>Invalid login credentials.</strong></div> : '';

    var loginDisplay = this.state.forgotPassword ?
      <div className="login-form">
        <PasswordReset />
      </div> :

      <div className="col-md-2 col-md-offset-10 login-form">
        <a className="facebook-signup btn btn-block btn-social btn-facebook" onClick={this.handleFacebookClick}>
          <i className="fa fa-facebook"></i> Log in with facebook
        </a>
        <form onSubmit={this.handleSubmit}>
          <input type="text" ref="email" className="form-control" placeholder="Email Address"></input>
          <div className="input-group">
            <input type="password" ref="password" className="form-control login-pwd" placeholder="Password"></input>
            <span className="input-group-btn">
              <button type="submit" className="btn btn-default">
                <span className="glyphicon glyphicon-ok"></span>
              </button>
            </span>
          </div>
          {errors}
        </form>
        <a onClick={this.handleForgotPasswordClick} href="#">Forgot your password?</a>
      </div>;

    return (
      <div>
        {loginDisplay}
      </div>
    );
  }
});

module.exports = Login;
