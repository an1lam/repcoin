'use strict';

var $ = require('jquery');
var Footer = require('./Footer.jsx');
var Navigation = require('react-router').Navigation;
var React = require('react');
var Toolbar = require('./Toolbar.jsx');

var VerificationPage = React.createClass({
  mixins: [Navigation],

  componentDidMount: function() {
    this.verifyUser(this.props.params.token);
  },

  getInitialState: function() {
    return { error: null };
  },

  verifyUser: function(token) {
    var data;
    if (this.props.params.inviterId && this.props.params.hash) {
      data = {
        verificationToken: token,
        inviterId: this.props.params.inviterId,
        hash: this.props.params.hash,
      };
    } else {
      data = { verificationToken: token };
    }
    $.ajax({
      url: '/api/verify/',
      type: 'POST',
      data: data,
      success: function(user) {
        // A successful verify means the user is already logged in
        this.transitionTo('/home');
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({ error: xhr.responseText });
      }.bind(this),
    });
  },

  render: function() {
    var error = this.state.error ? <div className="alert alert-danger" role="alert">{this.state.error}</div> : '';
    return (
      <div className="verificationPage">
        <div className="row">
          <Toolbar />
        </div>
        <div className="row">
          <div className="col-md-4 col-md-offset-4">
            {error}
          </div>
        </div>
        <div className="row footerrow">
          <Footer />
        </div>
      </div>
    );
  },
});

module.exports = VerificationPage;
