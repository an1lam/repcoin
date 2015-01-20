'use strict';

var $ = require('jquery');
var PubSub = require('pubsub-js');
var React = require('react');

// COMPONENT IS NOT CURRENTLY IN USE
var SuperScoreInput = React.createClass({
  updateDefaultCategory: function(category) {
    var url = '/api/users/' + this.props.user._id;
    var user = this.props.user;
    user.defaultCategory = category;
    $.ajax({
      url: url,
      type: 'PUT',
      data: user,
      success: function(user) {
        PubSub.publish('profileupdate');
        this.propagateReset();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
        this.propagateReset();
      }.bind(this)
    });
  },

  propagateReset: function() {
    this.props.onReset();
  },

  handleChange: function(event) {
    this.updateDefaultCategory($(event.currentTarget).val());
  },

  render: function() {
    var options = this.props.user.categories.length !== 0 ?
      <select onChange={this.handleChange} ref="defaultCategory" className="form-control">
        <option key='0'>Choose a category</option>
        {this.props.user.categories.map(function(category) {
          return <option key={category.id} value={category.name}>{category.name} : {category.percentile}</option>;
        })}
      </select> :
      <div className="defaultPanel panel panel-default">
        <div className="panel-body default-text">
          <p>You are not signed up for any expert categories yet. Add some to your profile via your Expert Categories Table.</p>
        </div>
      </div>;

    return (
      <div className="superScoreInput">
        {options}
        <button type="button" className="btn btn-default" onClick={this.propagateReset}>Cancel</button>
      </div>
    );
  }
});

module.exports = SuperScoreInput;
