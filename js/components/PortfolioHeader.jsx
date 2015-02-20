'use strict';

var React = require('react');
var strings = require('../lib/strings_utils.js');

var PortfolioHeader = React.createClass({
  componentDidMount: function() {
    $('.reps-available-info').popover({ trigger: 'hover focus' });
  },

  render: function() {
    var repsAvailable = '';
    var dividends = '';
    if (this.props.reps > -1) {
      repsAvailable = (
        <div>{strings.PORTFOLIO_HEADER_REPS(this.props.reps)}
        <span className="reps-available-info glyphicon glyphicon-info-sign"
          data-toggle="popover" data-placement="right"
          data-content={strings.REPS_AVAILABLE_INFO_CONTENT}></span></div>
      )
    }

    if (this.props.dividends) {
      dividends = (
        <div className="total-dividends-text">
          {strings.PORTFOLIO_HEADER_DIVIDENDS(this.props.dividends)}
        </div>
      );
    }
    return (
      <div className="portfolioHeader">
        <strong>{strings.PORTFOLIO_TABLE_TITLE(this.props.name)}</strong>
        {repsAvailable}
        {dividends}
      </div>
    );
  }
});

module.exports = PortfolioHeader;
