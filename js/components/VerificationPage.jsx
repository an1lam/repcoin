"use strict";

var $ = require('jquery');
var Navigation = require('react-router').Navigation;
var React = require('react');

var VerificationPage = React.createClass({
  mixins: [Navigation],

  componentDidMount: function() {
    this.verifyUser(this.props.params.token);
  },

  componentWillReceiveProps: function() {
    this.verifyUser(this.props.params.token);
  },

  getInitialState: function() {
    return {error: false};
  },

  verifyUser: function(token) {
    var data = {verificationToken: token};
    $.ajax({
      url: '/api/verify/',
      type: 'POST',
      data: data,
      success: function() {
        this.transitionTo('/login');
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({error: true});
      }.bind(this),
    });
  },

  render: function() {
    var error = this.state.error ? "We were unable to verify your account." : "";
    return (
      <div>
        {error}
      </div>
    );
  },
});

module.exports = VerificationPage;
