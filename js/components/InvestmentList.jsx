/** @jsx React.DOM */
"use strict";

var React = require('react');
var InvestmentItem = require('./InvestmentItem');

var InvestmentList = React.createClass({
  render: function() {
    return (
      <table className="investmentList table table-bordered">
        <tbody>
          {this.props.investments.map(function(investment) {
            return <InvestmentItem investment={investment} />;
         })}
        </tbody>
      </table>
    );
  }
});

module.exports = InvestmentList;
