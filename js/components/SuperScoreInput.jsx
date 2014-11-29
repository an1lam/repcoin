"use strict";

var $ = require('jquery');
var auth = require('../auth.jsx');
var PubSub = require('pubsub-js');
var React = require('react');

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
        auth.storeCurrentUser(user, function(user) {
          return user;
        });
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
    return (
      <div className="superScoreInput">
        <select onChange={this.handleChange} ref="defaultCategory" className="form-control">
          <option key='0'>Choose a category!</option>
          {this.props.user.categories.map(function(category) {
            return <option key={category.id} value={category.name}>{category.name} : {category.percentile}</option>; 
          })}
        </select>
        <button type="button" className="btn btn-default" onClick={this.propagateReset} >Cancel</button>
      </div>
    );
  }
});

module.exports = SuperScoreInput;
