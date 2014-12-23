'use strict';
var auth = require('../auth.jsx');
var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;

var PasswordReset = React.createClass({
  mixins: [Navigation],

  getInitialState: function() {
    return {
      error: false,
    };
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var email = this.refs.email.getDOMNode().value;
    $.ajax({
      type: 'POST',
      url: '/api/resetPassword',
      data: {
        'email': email
      },

      success: function() {
        this.setState({
          message: 'An email has been sent to ' + email + ' with a link to reset your password.'
        });
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({
          message: 'Invalid information provided.'
        });
      }.bind(this),
    });
  },

  render: function() {
    if (this.state.error) {
      var errors = (
        <div className="alert alert-danger" role="alert">
          <strong>Invalid login credentials.</strong>
        </div>
      );
    }

    return (
      <div className="col-md-2 col-md-offset-10">
        <form onSubmit={this.handleSubmit}>
          <div className="input-group">
            <input type="text" ref="email" className="form-control" placeholder="Email Address">
            </input>
            <span className="input-group-btn">
              <button type="submit" className="btn btn-default">
                <span className="glyphicon glyphicon-ok"></span>
              </button>
            </span>
          </div>
          {errors}
        </form>
      </div>
    );
  },
});

module.exports = PasswordReset;
