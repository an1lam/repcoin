/** @jsx React.DOM */
"use strict";

var React = require('react');

var PortfolioItem = React.createClass({
  render: function() {
    return (
      <tr className="portfolioItem">
        <td>{this.props.user}</td>
        <td>{this.props.category}</td>
        <td>{this.props.amount}</td>
      </tr>
    );
  }
});

module.exports = PortfolioItem;
