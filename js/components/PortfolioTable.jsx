/** @jsx React.DOM */
"use strict";

var React = require('react');
var PortfolioItem = require('./PortfolioItem.jsx');
var PortfolioHeader = require('./PortfolioHeader.jsx');

var PortfolioTable = React.createClass({
  render: function() {
    return (
      <div className="categoriesTable panel panel-default">
        <PortfolioHeader />
        <table className="table table-bordered table-striped">
          <tr className="PortfolioHeader">
            <th>User</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>
          <tbody>
          {this.props.user.portfolio.map(function(investment) {
            return <PortfolioItem user={investment.user} category={investment.category} amount={investment.amount} />;
          })}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = PortfolioTable;
