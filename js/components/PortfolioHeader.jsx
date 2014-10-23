/** @jsx React.DOM */
"use strict";

var React = require('react');

var PortfolioHeader = React.createClass({
  render: function() {
    return (
      <tr className="PortfolioHeader">
        <th>User</th>
        <th>Category</th>
        <th>Amount</th>
      </tr>
    );
  }
});

module.exports = PortfolioHeader;
