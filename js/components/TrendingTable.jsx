'use strict';

var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var TrendingTable = React.createClass({
  getInitialState: function() {
    return {
      leaders: [],
      timeframe: 'month',
    };
  },

  componentDidMount: function() {
    this.getLeaders(this.props.category);
  },

  componentWillReceiveProps: function(newProps) {
    this.getLeaders(newProps.category);
  },

  getDate: function() {
    var date = new Date();
    switch(this.state.timeframe) {
      case 'month':
        //date.setMonth(date.getMonth()-1);
        date.setYear(date.getYear()-300);
        break;
      default:
        date.setMonth(date.getMonth()-1);
        break;
    };
    return date;
  },

  getLeaders: function(category) {
    var url = '/api/users/' + category + '/trending/experts/' + this.getDate().toString();
    $.ajax({
      url: url,
      success: function(leaders) {
        this.setState({ leaders: leaders });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(xhr.responseText, status, err.toString());
      }.bind(this)
    });
  },

  getLeaderRows: function() {
    var leaderRows = [];
    var percentile, leader;
    var length = this.state.leaders.length;
    for (var i = 0; i < length; i++) {
      leader = this.state.leaders[i];
      for (var j = 0; j < leader.categories.length; j++) {
        if (leader.categories[j].name.toLowerCase() === this.props.category.toLowerCase()) {
          percentile = leader.categories[j].percentile;
          break;
        }
      }
      leaderRows.push(
        <tr key={leader._id}>
          <td><Link to="profile" params={{userId: leader._id}}>{leader.username}</Link></td>
          <td>{percentile}</td>
        </tr>
      );
    }
    return leaderRows;
  },

  render: function() {
    var leaders = this.getLeaderRows();
    var title = 'Trending experts this month';
    return (
      <div className="panel panel-default">
        <table className="table table-bordered">
          <thead>
          <tr><th colSpan="3">{title}</th></tr>
          <tr>
            <th>Name</th>
            <th>Percentile</th>
          </tr>
          </thead>
          <tbody>
            {leaders}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = TrendingTable;
