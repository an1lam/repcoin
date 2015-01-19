'use strict';

var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var TrendingTable = React.createClass({
  getInitialState: function() {
    return {
      leaders: [],
    };
  },

  componentDidMount: function() {
    this.getLeaders(this.props.category);
  },

  componentWillReceiveProps: function(newProps) {
    this.getLeaders(newProps.category, 'This month');
  },

  setTimeframe: function(e) {
    e.preventDefault();
    this.getLeaders(this.props.category, e.target.value);
  },

  getDate: function(timeframe) {
    var date = new Date();
    switch(timeframe) {
      case 'This year':
        date.setYear(date.getYear()-1);
        break;

      case 'This month':
        date.setMonth(date.getMonth()-1);
        break;

      case 'This week':
        date.setDate(date.getDate()-7);
        break;

      case 'Today':
        date.setDate(date.getDate()-1);
        break;

      default:
        date.setMonth(date.getMonth()-1);
        break;
    };
    return date;
  },

  getLeaders: function(category, timeframe) {
    var url = '/api/users/' + category + '/trending/experts/' + this.getDate(timeframe).toString();
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
    var title = 'Trending Experts';
    return (
      <div className="panel panel-default trending-table">
        <table className="table table-bordered">
          <thead>
          <tr>
            <th colSpan="3">
              <div className="trending-table-title">{title}</div>
              <select onChange={this.setTimeframe}>
                <option>This month</option>
                <option>This week</option>
                <option>Today</option>
                <option>This year</option>
              </select>
            </th>
          </tr>
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
