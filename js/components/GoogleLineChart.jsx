'use strict';

var $ = require('jquery');
var PubSub = require('pubsub-js');
var React = require('react');

var GoogleLineChart = React.createClass({

  getInitialState: function() {
    return { data: [] };
  },

  componentDidMount: function() {
    this.fetchData(this.props);
    this.drawCharts();
    PubSub.subscribe('googlecharts', this.drawCharts);
  },

  componentWillReceiveProps: function(newProps) {
    this.fetchData(newProps);
  },

  componentDidUpdate: function() {
    this.drawCharts();
  },

  fetchData: function(props) {
    var user = props.user;
    var category = props.category;
    var url = '/api/usersnapshots'
      + '/' + user._id
      + '/' + category
      + '/' + this.props.usertype
      + '/' + this.props.datatype;
    $.ajax({
      url: url,
      success: function(data) {
        this.setState({ data: data });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
      }.bind(this)
    });
  },

  drawCharts: function() {
    // Do nothing if google is not initialized
    if (!googleLoaded || this.state.data.length === 0) {
      return;
    }

    var data = google.visualization.arrayToDataTable(this.state.data);
    var options = {
      legend: 'none',
      pointSize: 5,
      title: this.getTitle(),
      series: {
        0: {targetAxisIndex: 0},
        1: {targetAxisIndex: 1}
      },
      vAxes: {
        // Adds titles to each axis.
        0: {title: this.getYAxisTitle()},
      },
      hAxis: {
        title: 'Date',
      },
    };
    var chart = new google.visualization.LineChart(document.getElementById(this.props.datatype));
    chart.draw(data, options);
  },

  getYAxisTitle: function() {
    var title;
    switch(this.props.datatype) {
      case 'ranks':
        title = 'Rank';
        break;

      case 'reps':
        title = 'Reps';
        break;

      case 'percentreturns':
        title = 'Percent Return';
        break;

      case 'dividends':
        title = 'Reps';
        break;

      default:
        title = 'Default';
        break;
    };
    return title;
  },

  getTitle: function() {
    var title;
    switch(this.props.datatype) {
      case 'ranks':
        title = 'Rank';
        break;

      case 'reps':
        title = 'Reps';
        break;

      case 'percentreturns':
        title = 'Percent Returns';
        break;

      case 'dividends':
        title = 'Total Dividends';
        break;

      default:
        title = 'Default';
        break;
    };
    return title;
  },

  render: function() {
    return (
      <div className="chart" id={this.props.datatype}></div>
    );
  },
});

module.exports = GoogleLineChart;
