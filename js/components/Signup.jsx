'use strict';
var $ = require('jquery');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var Navigation = Router.Navigation;
var strings = require('../lib/strings_utils.js');

var Signup = React.createClass({
  mixins: [Navigation],

  getInitialState: function() {
    return {
      error: false,
      msg: null
    };
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
        if (this.props.id && this.props.hash) {
          this.logShared(this.props.id, this.props.hash)
        }
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
      this.setState({ error: true, msg: strings.FIELDS_BLANK });
      return;
    }

    if (email !== email2) {
      this.setState({ error: true, msg: strings.EMAILS_DO_NOT_MATCH });
      return;
    }
    if (password !== password2) {
      this.setState({ error: true, msg: strings.PASSWORDS_DO_NOT_MATCH });
      return;
    }

    this.setState({ error: false, msg: strings.VALIDATING });
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
        this.setState({ error: false, msg: strings.VERIFICATION_EMAIL_SENT });
        if (this.props.hash && this.props.id) {
          this.logShared(this.props.id, this.props.hash);
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

  logShared: function(id, hash) {
    $.ajax({
      url: '/api/users/share',
      type: 'POST',
      data: {
        id: id,
        hash: hash,
      },
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
  }
});

module.exports = Signup;
