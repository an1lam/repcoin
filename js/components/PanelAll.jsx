'use strict';

var GoogleLineChart = require('./GoogleLineChart.jsx');
var React = require('react');
var UserTable = require('./UserTable.jsx');

var PanelAll = React.createClass({
  render: function() {
    return (
      <div className="panel-all">
        <h1>General Dashboard</h1>
        <UserTable user={this.props.user} />
      </div>
    )
  }
});

module.exports = PanelAll;
