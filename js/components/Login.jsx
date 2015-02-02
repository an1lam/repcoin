'use strict';
var auth = require('../auth.jsx');
var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;
var PasswordReset = require('./PasswordReset.jsx');
var strings = require('../lib/strings_utils.js');

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
    auth.logIn(email, password, function(loggedIn, err) {
      if (loggedIn) {
        this.transitionTo('/home');
      } else {
        return this.setState({error: err});
      }
    }.bind(this));
  },

  handleForgotPasswordClick: function(e) {
    e.preventDefault();
    this.setState({ forgotPassword: true });
  },

  handleFacebookClick: function(e) {
    e.preventDefault();
    FB.login(this.loginCallback, { scope: 'email', return_scopes: true });
  },

  loginCallback: function(response) {
    if (response.status === 'connected') {
      this.loginUser(response.authResponse.accessToken);
    } else if (response.status === 'not_authorized') {
      this.setState({ error: true, msg: strings.FACEBOOK_UNAUTHORIZED_CREDENTIALS });
    } else {
      this.setState({ error: true, msg: strings.ERROR_LOGGING_INTO_FACEBOOK });
    }
  },

  loginUser: function(accessToken) {
    $.ajax({
      url: '/api/login/facebook',
      type: 'POST',
      data: { access_token: accessToken },
      success: function(user) {
        // Only rewrite the picture if it is not there
        if (!user.picture) {
          this.getFacebookProfilePicture(user);
        } else {
          this.transitionTo('/home');
        }
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseText !== 'Error') {
          this.setState({ error: true, msg: xhr.responseText });
        }
        console.error(xhr.responseText);
      }.bind(this)
    });
  },

  getFacebookProfilePicture: function(user) {
    var cb = function(user) {
      this.transitionTo('/home');
    }.bind(this);

    FB.api('/me/picture',
      {
        'redirect': false,
        'type': 'normal',
        'width': 200,
        'height': 200
      },
      function (response) {
        if (response && !response.error) {
          this.saveFacebookPhoto(user,
            response.data.url, cb);
        } else {
          cb(user);
        }
      }.bind(this)
    );
  },

  saveFacebookPhoto: function(user, link, cb) {
    var url = '/api/users/'+ user._id;

    // Mark facebook pictures as such with the special public_id
    user.picture = { url: link, public_id: 'FACEBOOK' };
    $.ajax({
      url: url,
      type: 'PUT',
      data: user,
      success: function(user) {
        cb(user);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
        cb(user)
      }.bind(this)
    });
  },


  render: function() {
    var errors = this.state.error ? <div className="alert alert-danger" role="alert"><strong>{this.state.error}</strong></div> : '';

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
  }
});

module.exports = Login;
