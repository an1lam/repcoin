'use strict';

var $ = require('jquery');
var PubSub = require('pubsub-js');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var CategoryPageHeader = React.createClass({

  // Make a user an expert for this category
  setExpertCategory: function(event) {
    event.preventDefault();
    $.ajax({
      url: '/api/users/' + this.props.currentUser._id + '/addexpert/' +
        this.props.category.name,
      type: 'PUT',
      success: function(user) {
        // No user means the user is already an expert
        if (user) {
          PubSub.publish('userupdate');
          return user;
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  // Determine whether or not a user is already an expert
  isExpert: function(user) {
    for (var i = 0; i < user.categories.length; i++) {
      if (user.categories[i].id === this.props.category._id) {
        return true;
      }
    }

    return false;
  },

  render: function() {
    var expertBtn = '';
    if (this.props.currentUser && this.isExpert(this.props.currentUser)) {
      expertBtn = <div className="alert alert-success" role="alert">{strings.YOU_ARE_AN_EXPERT(this.props.category.name)}</div>
    } else if (this.props.currentUser) {
      expertBtn = (
        <button onClick={this.setExpertCategory}
        className='btn btn-default'>
        Become a {this.props.category.name} expert!</button>
      );
    }

    return (
      <div className="categoryPageHeader row">
        <div className="col-md-4 col-md-offset-4">
          <h1 className="text-center">{this.props.category.name}</h1>
          <h4 className="text-center">Experts: {this.props.category.experts}</h4>
          <h4 className="text-center">Investors: {this.props.category.investors}</h4>
          <h4 className="text-center">Market Size: {this.props.category.reps} Reps</h4>
        </div>
        <div className="col-md-2 col-md-offset-1">
          {expertBtn}
        </div>
      </div>
    );
  }
});

module.exports = CategoryPageHeader;
