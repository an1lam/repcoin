'use strict';

var React = require('react');
var strings = require('../lib/strings_utils.js');

var PortfolioHeader = React.createClass({
  render: function() {
    var repsAvailable = '';
    if (this.props.reps > -1) {
      repsAvailable = <p>{strings.PORTFOLIO_HEADER_REPS(this.props.reps)}</p>;
    }
    return (
      <div className="portfolioHeader">
        <strong>{strings.PORTFOLIO_TABLE_TITLE(this.props.name)}</strong>
        {repsAvailable}
      </div>
    );
  }
});

module.exports = PortfolioHeader;
