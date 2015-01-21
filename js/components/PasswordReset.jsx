'use strict';
var auth = require('../auth.jsx');
var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;
var strings = require('../lib/strings_utils.js');

var PasswordReset = React.createClass({
  getInitialState: function() {
    return {
      message: null,
    };
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var email = this.refs.email.getDOMNode().value;
    $.ajax({
      type: 'POST',
      url: '/api/users/sendPasswordResetEmail',
      data: {
        'email': email
      },

      success: function() {
        this.setState({
          message: strings.EMAIL_SENT(email)
        });
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({ message: xhr.responseText });
      }.bind(this),
    });
  },

  render: function() {
    if (this.state.message) {
      var msg = (
        <div className="alert alert-info" role="alert">
          <strong>{this.state.message}</strong>
        </div>
      );
    }

    return (
      <div className="col-md-2 col-md-offset-10 password-reset">
        <form onSubmit={this.handleSubmit}>
          <div className="input-group">
            <input type="text" ref="email" className="form-control" placeholder="Enter email address">
            </input>
            <span className="input-group-btn">
              <button type="submit" className="btn btn-default">
                <span className="glyphicon glyphicon-ok"></span>
              </button>
            </span>
          </div>
          {msg}
        </form>
      </div>
    );
  },
});

module.exports = PasswordReset;
