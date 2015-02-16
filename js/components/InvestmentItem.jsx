'use strict';

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var InvestmentItem = React.createClass({
  render: function() {
    var dividendPercentage = (Math.floor(this.props.investment.dividend / this.props.investment.amount)*100);
    return (
      <tr className="investmentItem">
        <td>
          <Link to="profile" params={{userId: this.props.investment.userId}}>{this.props.investment.user}</Link>
        </td>
        <td>{this.props.investment.amount}</td>
        <td>{this.props.investment.dividend} reps, {dividendPercentage}% {"return"}</td>
      </tr>
    );
  },
});

module.exports = InvestmentItem;
