/** @jsx React.DOM */
"use strict";

var React = require('react');

var DonationBox = React.createClass({
  render: function() {
    return (
      <div className="donationBox">
        <form className="navbar-form">
          <p className="navbar-text">Give</p>
          <p className="navbar-text">{this.props.user.name}</p>
          <input type="text" className="donationAmount form-control" placeholder="10"></input>
            <p className="navbar-text">Reps for</p>
            <select className="form-control donationCategories">
              <option selected="selected">Category</option>
              <option>Coding</option>
              <option>Jazz</option>
              <option>Skiing</option>
            </select>
            <button type="submit" className="btn btn-default">Give</button>
          </form>
        </div>
      );
  }
});

module.exports = DonationBox;
