/** @jsx React.DOM */
"use strict";

var React = require('react');
var InvestmentList = require('./InvestmentList');

var PortfolioItem = React.createClass({
  render: function() {
    return (
      <tr className="portfolioItem">
        <td>{this.props.category.category}</td>
        <td>{this.props.category.repsAvailable}</td>
        <td><InvestmentList investments={this.props.category.investments}/></td>
      </tr>
    );
  }
});

module.exports = PortfolioItem;
