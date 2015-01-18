"use strict";

var InvestmentItem = require('./InvestmentItem');
var React = require('react');

var InvestmentList = React.createClass({
  render: function() {
    return (
      <table className="investmentList table table-bordered">
        <tbody>
          {this.props.investments.map(function(investment) {
            return <InvestmentItem key={investment.timeStamp} investment={investment} />;
         })}
        </tbody>
      </table>
    );
  }
});

module.exports = InvestmentList;
