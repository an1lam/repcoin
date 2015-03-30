'use strict';

var GoogleLineChart = require('./GoogleLineChart.jsx');
var React = require('react');
var CategoryInvestorTable = require('./CategoryInvestorTable.jsx');

var CategoryPanelInvestor = React.createClass({
  render: function() {
    return (
      <div className="panel-all">
        <h1>Investor Dashboard</h1>
        <CategoryInvestorTable user={this.props.user} category={this.props.category} />
      </div>
    )
  }
});

module.exports = CategoryPanelInvestor;
