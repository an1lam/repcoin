/** @jsx React.DOM */
"use strict";

var React = require('react');

var PortfolioHeader = React.createClass({
  render: function() {
    return (
      <div className="PortfolioHeader">
        <div className="portfolioTitle">
          <strong>Portfolio</strong>
        </div>
        <tr className="PortfolioHeader">
          <th>User</th>
          <th>Category</th>
          <th>Amount</th>
        </tr>
      </div>
    );
  }
});

module.exports = PortfolioHeader;
