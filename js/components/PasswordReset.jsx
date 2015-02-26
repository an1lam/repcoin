'use strict';
var auth = require('../auth.jsx');
var AuthActionCreator = require('../actions/AuthActionCreator.js');
var AuthStore = require('../stores/AuthStore.js');
var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;
var strings = require('../lib/strings_utils.js');

function getStateFromStores() {
  return {
    message: AuthStore.getPasswordResetStatus()
  }
}

var PasswordReset = React.createClass({
  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    AuthStore.addStatusListener(this._onChange);
  },

  componentWillUnmount: function() {
    AuthStore.removeStatusListener(this._onChange);
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var email = this.refs.email.getDOMNode().value;
    AuthActionCreator.sendPasswordResetEmail(email);
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
      <div className="password-reset">
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

  _onChange: function() {
    this.setState(getStateFromStores());
  },
});

module.exports = PasswordReset;
