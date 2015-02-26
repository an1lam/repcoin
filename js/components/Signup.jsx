'use strict';
var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var Navigation = Router.Navigation;

var AuthActionCreator = require('../actions/AuthActionCreator.js');
var AuthStore = require('../stores/AuthStore.js')
var strings = require('../lib/strings_utils.js');


function getStateFromStores() {
  return {
    error: AuthStore.getSignUpError(),
    msg: AuthStore.getSignUpStatus(),
    currentUser: AuthStore.getCurrentUser(),
  };
}

var Signup = React.createClass({
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

  handleFacebookClick: function(e) {
    e.preventDefault();
    AuthActionCreator.loginWithFacebook();
  },

  transitionIfReady: function() {
    if (this.state.currentUser) {
      this.transitionTo('/home');
    }
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var firstname = this.refs.firstname.getDOMNode().value.trim();
    var lastname = this.refs.lastname.getDOMNode().value.trim();
    var email = this.refs.email.getDOMNode().value.trim();
    var email2 = this.refs.email2.getDOMNode().value.trim();
    var password = this.refs.password.getDOMNode().value;
    var password2 = this.refs.password2.getDOMNode().value;
    AuthActionCreator.signUpUser(
      firstname, lastname, email, email2, password, password2, this.props.hash,
      this.props.id);
    $(".pwd-field1").val('');
    $(".pwd-field2").val('');
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
        <a className="facebook-signup btn btn-block btn-social btn-facebook" onClick={this.handleFacebookClick}>
          <i className="fa fa-facebook"></i>{strings.LOG_IN_WITH_FACEBOOK}
        </a>
        <form onSubmit={this.handleSubmit}>
          <input type="text" ref="firstname" className="form-control" placeholder="First name"></input>
          <input type="text" ref="lastname" className="form-control" placeholder="Last name"></input>
          <input type="text" ref="email" className="form-control" placeholder="Email"></input>
          <input type="text" ref="email2" className="form-control" placeholder="Re-enter email"></input>
          <input type="password" ref="password" className="pwd-field1 form-control" placeholder="Password"></input>
          <input type="password" ref="password2" className="pwd-field2 form-control" placeholder="Re-enter password"></input>
          <button type="submit" className="signupSubmit btn btn-default">Sign Up</button>
          <p className="accept-terms">By signing up, you accept our <Link to="termsOfService">{strings.TERMS_OF_SERVICE}</Link>.</p>
        </form>
      </div>
    );
  },

  _onChange: function() {
    this.setState(getStateFromStores());
  },

  _onUserChange: function() {
    this.setState(getStateFromStores());
    this.transitionIfReady();
  },
});

module.exports = Signup;
