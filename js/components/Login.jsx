'use strict';
var AuthActionCreator = require('../actions/AuthActionCreator.js');
var AuthStore = require('../stores/AuthStore.js');
var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;
var PasswordReset = require('./PasswordReset.jsx');
var strings = require('../lib/strings_utils.js');

function getStateFromStores() {
  return {
    msg: AuthStore.getLoginStatus(),
    error: AuthStore.getLoginError(),
    forgotPassword: AuthStore.getForgotPassword(),
    currentUser: AuthStore.getCurrentUser(),
  }
}

var Login = React.createClass({
  mixins: [Navigation],

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    AuthStore.addStatusListener(this._onChange);
    AuthStore.addCurrentUserListener(this._onUserChange);
  },

  componentWillUnmount: function() {
    AuthStore.removeStatusListener(this._onChange);
    AuthStore.removeCurrentUserListener(this._onUserChange);
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var email = this.refs.email.getDOMNode().value;
    var password = this.refs.password.getDOMNode().value;
    AuthActionCreator.loginUser(email, password);
    $(".login-pwd").val('');
  },

  handleForgotPasswordClick: function(e) {
    e.preventDefault();
    AuthActionCreator.forgotPassword();
  },

  handleFacebookClick: function(e) {
    e.preventDefault();
    AuthActionCreator.loginWithFacebook();
  },

  transitionIfReady: function() {
    if (this.state.currentUser) {
      this.transitionTo('/home');
    }
  },

  render: function() {
    var errors = this.state.error ? <div className="alert alert-danger" role="alert"><strong>{this.state.msg}</strong></div> : '';

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
        <a onClick={this.handleForgotPasswordClick} href="#">{strings.FORGOT_PASSWORD}</a>
      </div>;

    return (
      <div>
        {loginDisplay}
      </div>
    );
  },

  _onUserChange: function() {
    this.setState(getStateFromStores());
    this.transitionIfReady();
  },

  _onChange: function() {
    this.setState(getStateFromStores());
  },
});

module.exports = Login;
