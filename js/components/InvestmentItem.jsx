'use strict';

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var InvestmentItem = React.createClass({
  render: function() {
    var dividendPercentage = Math.floor(this.props.investment.dividend / this.props.investment.amount*100);
    return (
      <li className="investmentItem">
        <span>
          <Link to="profile" params={{userId: this.props.investment.userId}}>{this.props.investment.user}</Link>
        </span>
        <span>{this.props.investment.amount}</span>
        <span>{this.props.investment.dividend} reps, {dividendPercentage}% {"return"}</span>
      </li>
    );
  },
});

module.exports = InvestmentItem;
