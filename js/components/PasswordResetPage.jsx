'use strict';
var auth = require('../auth.jsx');
var Footer = require('./Footer.jsx');
var Toolbar = require('./Toolbar.jsx');
var Navigation = require('react-router').Navigation;
var React = require('react');

var PasswordResetPage = React.createClass({
  mixins: [Navigation],

  getInitialState: function() {
    return {error: ''};
  },

  updateUserWithNewPassword: function() {
    event.preventDefault();
    var token = this.props.params.token;
    var password1 = this.refs.password1.getDOMNode().value;
    var password2 = this.refs.password2.getDOMNode().value;
    if (password1 !== password2) {
      this.setState({error: 'The two passwords you entered don\'t match.'});
      return;
    }

    var data = {token: token, password: password1};
    $.ajax({
      url: '/api/users/newPassword',
      type: 'POST',
      data: data,
      success: function(user) {
        // A successful response means user is already logged in
        // We just need to store the user in the token
        auth.storeCurrentUser(user, function() {
          this.transitionTo('/home');
        }.bind(this));
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(xhr);
        this.setState({
          error: xhr.responseText,
        });
      }.bind(this),
    });
  },

  render: function() {
    return (
      <div className="passwordResetPage">
        <Toolbar />
        <div className="col-md-3 col-md-offset-3">
          <form onSubmit={this.updateUserWithNewPassword}>
              <input type="password" ref="password1" className="form-control" placeholder="Password"></input>
              <div className="input-group">
                <input type="password" ref="password2" className="form-control" placeholder="Confirm password"></input>
                <span className="input-group-btn">
                  <button type="submit" className="btn btn-default">
                    <span className="glyphicon glyphicon-ok"></span>
                  </button>
                </span>
              </div>
          </form>
          {this.state.error}
        </div>
        <Footer />
      </div>
    );
  },
});

module.exports = PasswordResetPage;
