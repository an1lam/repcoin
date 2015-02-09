'use strict';

var $ = require('jquery');
var React = require('react');

var CategoryRequestPage = React.createClass({
  getInitialState: function() {
    return { message: null };
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var password = this.refs.password.getDOMNode().value;
    $('.pwd').val('');
    var params = this.props.params;
    this.handleRequestedCategory(params.userId, params.categoryName, params.action, params.expert, password);
  },

  handleRequestedCategory: function(userId, name, action, expert, password) {
    $.ajax({
      url: '/api/users/' + userId + '/' + name + '/' + action + '/' + expert,
      data: { password: password },
      type: 'POST',
      success: function(user) {
        this.setState({ message: 'Approval succeeded' });
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({ message: xhr.responseText });
      }.bind(this),
    });
  },

  render: function() {
    var message = this.state.message ? <div className="alert alert-info" role="alert">{this.state.message}</div> : '';
    return (
      <div className="categoryRequestPage">
        {message}
        <form onSubmit={this.handleSubmit}>
          <input type="password" ref="password" className="pwd form-control" placeholder="Password"></input>
          <button type="submit" className="btn btn-default">Submit</button>
        </form>
      </div>
    );
  },
});

module.exports = CategoryRequestPage;
