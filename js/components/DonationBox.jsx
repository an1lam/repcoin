/** @jsx React.DOM */
"use strict";

var React = require('react');
var $ = require('jquery');
var PubSub = require('pubsub-js');
var auth = require('../auth.jsx');

var DonationBox = React.createClass({
  getInitialState: function() {
    return { donationError: "" };
  },

  validateTransaction: function(categoryName, reps) {
    var transactionCategory;
    for (var i = 0; i < this.props.user.categories.length; i++) {
      var currentCategory = this.props.user.categories[i];
      if (currentCategory.name === categoryName) {
        transactionCategory = currentCategory;
      }
    }

    if (!transactionCategory || transactionCategory.reps < reps) {
      this.setState({donationError: true});
    } else {
      this.setState({donationError: false});
      this.createTransaction(this.props.user, this.props.currentUser, categoryName, reps);
    }
  },

  createTransaction: function(toUser, fromUser, category, amount) {
    var to = { "name": toUser.username, "id": toUser._id };
    var from = { "name": fromUser.username, "id": fromUser._id };
    $.ajax({
      url: '/api/transactions',
      type: 'POST',
      data: {
        to: to,
        from: from,
        category: category,
        amount: amount,
      },
      success: function(transaction) {
        $.ajax({
          url: '/api/users/' + fromUser._id,
          type: 'GET',
          success: function(user) {
            auth.storeCurrentUser(user, function(user) {
              return user;
            });
            PubSub.publish('profileupdate');
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(status, err.toString());
          },
        });

      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var reps = parseInt(this.refs.reps.getDOMNode().value);
    var categoryName = this.refs.category.getDOMNode().value;
    this.validateTransaction(categoryName, reps);
    this.refs.reps.getDOMNode().value = 0;
  },

  render: function() {
    var donationError = this.state.donationError ? <p>You don't have that many reps in that category!</p> : "";
    var currentUserCategories = this.props.currentUser.categories;
    var donatableCategories = this.props.user.categories.map(function(category) {
      for (var i = 0; i < currentUserCategories.length; i++) {
        if (currentUserCategories[i].name === category.name) {
          return <option value={category.name}>{category.name}</option>;
        }
      }
    });
    return (
      <div className="donationBox">
        <div className="navbar navbar-default">
        <form onSubmit={this.handleSubmit} className="navbar-form">
          <p className="give navbar-text">Give</p>
          <p className="user navbar-text">{this.props.user.username}</p>
          <input type="text" ref="reps" className="donationAmount form-control" placeholder="10"></input>
            <p className="navbar-text">Reps for</p>
            <select ref="category" className="form-control donationCategories">
              {donatableCategories}
            </select>
            <button type="submit" className="donationButton btn btn-lg btn-primary">Give</button>
        </form>
        {donationError}
        </div>
      </div>
    );
  }
});

module.exports = DonationBox;
