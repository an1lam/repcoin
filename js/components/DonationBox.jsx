/** @jsx React.DOM */
"use strict";

var React = require('react');

var DonationBox = React.createClass({
  render: function() {
    return (
      <div className="donationBox">
        <p className="give donationText">Give</p>
        <p className="donationText">{this.props.user.name}</p>
        <form>
          <input type="text" className="donationAmount form-control" placeholder="10"></input>
          <p>Reps for </p>
          <div className="donationDropdown dropdown">
            <button className="btn btn-default dropdown-toggle" type="button" id="donationDropdown" data-toggle="dropdown">
                Category
                <span className="caret"></span>
              </button>
              <ul className="dropdown-menu" role="menu" aria-labelledby="donationDropdown">
            </ul>
            </div>
            <button type="submit" className="btn btn-default">Give</button>
          </form>
        </div>
      );
  }
});

module.exports = DonationBox;
