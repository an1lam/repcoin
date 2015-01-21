'use strict';

var React = require('react');
var strings = require('../lib/strings_utils.js');

var PortfolioHeader = React.createClass({
  render: function() {
    return (
      <div className="portfolioHeader">
        <strong>{strings.PORTFOLIO_TABLE_TITLE(this.props.name)}</strong>
      </div>
    );
  }
});

module.exports = PortfolioHeader;
