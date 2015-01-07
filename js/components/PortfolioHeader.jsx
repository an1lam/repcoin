'use strict';

var React = require('react');

var PortfolioHeader = React.createClass({
  render: function() {
    return (
      <div className="portfolioHeader">
        <strong>{this.props.name}'s Investor Categories</strong>
      </div>
    );
  }
});

module.exports = PortfolioHeader;
