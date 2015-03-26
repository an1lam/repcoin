'use strict';

var GoogleLineChart = require('./GoogleLineChart.jsx');
var React = require('react');
var CategoryExpertTable = require('./CategoryExpertTable.jsx');

var CategoryPanelExpert = React.createClass({
  render: function() {
    return (
      <div className="panel-all">
        <h1>Expert Dashboard</h1>
        <CategoryExpertTable user={this.props.user} category={this.props.category} />
      </div>
    )
  }
});

module.exports = CategoryPanelExpert;
