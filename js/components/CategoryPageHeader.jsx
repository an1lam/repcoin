'use strict';

var $ = require('jquery');
var auth = require('../auth.jsx');
var PubSub = require('pubsub-js');
var React = require('react');

var CategoryPageHeader = React.createClass({

  setInvestorCategory: function(event) {
    event.preventDefault();
    $.ajax({
      url: '/api/users/' + this.props.currentUser._id + '/addinvestor/' +
        this.props.category.name,
      type: 'PUT',
      success: function(user) {
        // No user means the user is already an investor
        if (user) {
          auth.storeCurrentUser(user, function(user) {
            PubSub.publish('userupdate');
            return user;
          });
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
   });
  },

  setExpertCategory: function(event) {
    event.preventDefault();
    $.ajax({
      url: '/api/users/' + this.props.currentUser._id + '/addexpert/' +
        this.props.category.name,
      type: 'PUT',
      success: function(user) {
        // No user means the user is already an investor
        if (user) {
          auth.storeCurrentUser(user, function(user) {
            PubSub.publish('userupdate');
            return user;
          });
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  isExpert: function(user) {
    for (var i = 0; i < user.categories.length; i++) {
      if (user.categories[i].id === this.props.category._id) {
        return true;
      }
    }
    return false;
  },

  isInvestor: function(user) {
    for (var i = 0; i < user.portfolio.length; i++) {
      if (user.portfolio[i].category === this.props.category.name) {
        return true;
      }
    }
    return false;
  },

  render: function() {
    var expertBtn = <button onClick={this.setExpertCategory} className="btn btn-default">Become a {this.props.category.name} expert!</button>;
    if (this.isExpert(this.props.currentUser)) {
      expertBtn = <div className="alert alert-success" role="alert">You are a {this.props.category.name} expert.</div>
    }

    var investorBtn = <button onClick={this.setInvestorCategory} className="btn btn-default">Become a {this.props.category.name} investor!</button>;
    if (this.isInvestor(this.props.currentUser)) {
      investorBtn = <div className="alert alert-success" role="alert">You are a {this.props.category.name} investor.</div>
    }

    return (
      <div className="categoryPageHeader row">
        <div className="col-md-4 col-md-offset-4">
          <h1 className="text-center">{this.props.category.name}</h1>
          </div>
        </div>
        <div className="col-md-2 col-md-offset-1">
          {expertBtn}
          {investorBtn}
        </div>
        <h4 className="text-center">Total reps in {this.props.category.name}: {this.props.category.reps}</h4>
      </div>
    );
  }
});

module.exports = CategoryPageHeader;
