/** @jsx React.DOM */
"use strict";

var React = require('react');

var PortfolioHeader = React.createClass({
  render: function() {
    return (
      <div className="portfolioHeader">
        <strong>Portfolio</strong>
      </div>
    );
  }
});

module.exports = PortfolioHeader;
