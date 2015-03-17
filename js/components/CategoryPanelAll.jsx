'use strict';

var GoogleLineChart = require('./GoogleLineChart.jsx');
var React = require('react');
var CategoryUserTable = require('./CategoryUserTable.jsx');

var PanelAll = React.createClass({
  render: function() {
    return (
      <div className="panel-all">
        <h1>General Dashboard</h1>
        <CategoryUserTable user={this.props.user} category={this.props.category} />
      </div>
    )
  }
});

module.exports = PanelAll;
