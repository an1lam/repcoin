/** @jsx React.DOM */
"use strict";

var React = require('react');
var $ = require('jquery');

var DonationBox = React.createClass({
  getInitialState: function() {
    return {
      donationError: "",
      user: {
        categories: []
      }
    };
  },

  componentDidMount: function() {
    this.setUser('/api/users/' + this.props.userId);
  },

  componentWillReceiveProps: function(newProps) {
    this.setUser('/api/users/' + newProps.userId);
  },

  setUser: function(url) {
    $.ajax({
      url: url,
      success: function(user) {
        this.setState({ user: user });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.userId, status, err.toString());
      }.bind(this)
    });
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var reps = parseInt(this.refs.reps.getDOMNode().value);
    var categoryName = this.refs.category.getDOMNode().value;
    var category;
    for (var i = 0; i < this.state.user.categories.length; i++) {
      var currentCategory = this.state.user.categories[i];
      if (currentCategory.name === categoryName) {
        category = currentCategory;
      }
    }
    if (category.directScore < reps) {
      this.setState({donationError: true});
    } else {
      this.setState({donationError: false});
      // TODO: Actually create a new transaction here rather than just resetting and remove the logging
      console.log(reps);
      console.log(category);
    }
    this.refs.reps.getDOMNode().value = 0;
  },

  render: function() {
    var donationError = this.state.donationError ? <p>You don't have that many reps in that category!</p> : "";
    return (
      <div className="donationBox">
        <div className="navbar navbar-default">
        <form onSubmit={this.handleSubmit} className="navbar-form">
          <p className="give navbar-text">Give</p>
          <p className="user navbar-text">{this.state.user.username}</p>
          <input type="text" ref="reps" className="donationAmount form-control" placeholder="10"></input>
            <p className="navbar-text">Reps for</p>
            <select ref="category" className="form-control donationCategories">            {this.state.user.categories.map(function(category) {
                return <option value={category.name}>{category.name}</option>;
              })}
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
