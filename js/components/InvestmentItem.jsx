"use strict";

var React = require('react');

var InvestmentItem = React.createClass({
  render: function() {
    console.log("USER: " + this.props.investment.user);
    console.log("PERCENTAGE: " + this.props.investment.percentage);
    console.log("VALUATION: " + this.props.investment.valuation);
    console.log("AMOUNT: " + this.props.investment.amount);
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
