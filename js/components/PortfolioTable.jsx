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
            <th>Category</th>
            <th>Reps Available</th>
            <th>
              <div>Investments</div>
              <div className="subtitle">User / Amount / Valuation</div>
            </th>
          </tr>
          <tbody>
          {this.props.user.portfolio.map(function(category) {
            return <PortfolioItem category={category} />;
          })}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = PortfolioTable;
