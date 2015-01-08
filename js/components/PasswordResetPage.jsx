'use strict';
var Footer = require('./Footer.jsx');
var Toolbar = require('./Toolbar.jsx');
var Navigation = require('react-router').Navigation;
var React = require('react');

var PasswordResetPage = React.createClass({
  mixins: [Navigation],

  getInitialState: function() {
    return { error: null };
  },

  updateUserWithNewPassword: function() {
    event.preventDefault();
    var token = this.props.params.token;
    var password1 = this.refs.password1.getDOMNode().value;
    var password2 = this.refs.password2.getDOMNode().value;

    $(".pwd1").val('');
    $(".pwd2").val('');
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
        this.transitionTo('/home');
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
    var error = this.state.error ? <div className="alert alert-danger" role="alert">{this.state.error}</div> : '';
    return (
      <div className="passwordResetPage">
        <Toolbar />
        <h1 className="passwordResetTitle">Choose a New Password</h1>
        <div className="col-md-4 col-md-offset-4">
          <form onSubmit={this.updateUserWithNewPassword}>
              <input type="password" ref="password1" className="form-control pwd2" placeholder="Password"></input>
              <div className="input-group">
                <input type="password" ref="password2" className="form-control pwd1" placeholder="Confirm password"></input>
                <span className="input-group-btn">
                  <button type="submit" className="btn btn-default">
                    <span className="glyphicon glyphicon-ok"></span>
                  </button>
                </span>
              </div>
          </form>
          {error}
        </div>
        <Footer />
      </div>
    );
  },
});

module.exports = PasswordResetPage;
