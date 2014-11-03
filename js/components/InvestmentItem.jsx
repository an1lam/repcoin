"use strict";

var React = require('react');

var InvestmentItem = React.createClass({
  render: function() {
    return (
      <tr className="investmentItem">
        <td>{this.props.investment.user}</td>
        <td>{this.props.investment.amount}</td>
        <td>{this.props.investment.valuation}</td>
      </tr>
    );
  },
});

module.exports = InvestmentItem;
