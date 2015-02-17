'use strict';

var $ = require('jquery');
var React = require('react');

var GhostRequestPage = React.createClass({
  getInitialState: function() {
    return { message: null };
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var password = this.refs.password.getDOMNode().value;
    $('.pwd').val('');
    var params = this.props.params;
    this.handleRequestedGhost(params.userId, params.ghostName, params.action, password);
  },

  handleRequestedGhost: function(userId, name, action, password) {
    $.ajax({
      url: '/api/users/' + userId + '/ghost/' + name + '/' + action,
      data: { password: password },
      type: 'POST',
      success: function(msg) {
        this.setState({ message: msg });
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({ message: xhr.responseText });
      }.bind(this),
    });
  },

  render: function() {
    var message = this.state.message ? <div className="alert alert-info" role="alert">{this.state.message}</div> : '';
    return (
      <div className="ghostRequestPage">
        <h1>Ghost User Approval</h1>
        {message}
        <form onSubmit={this.handleSubmit}>
          <input type="password" ref="password" className="pwd form-control" placeholder="Password"></input>
          <button type="submit" className="btn btn-default">Submit</button>
        </form>
      </div>
    );
  },
});

module.exports = GhostRequestPage;
