'use strict';

var $ = require('jquery');
var MiniInvestButton = require('./MiniInvestButton.jsx');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var strings = require('../lib/strings_utils.js');

var TrendingTable = React.createClass({
  getInitialState: function() {
    return {
      leaders: [],
    };
  },

  componentDidMount: function() {
    this.getLeaders(this.props.category.name);
  },

  componentWillReceiveProps: function(newProps) {
    this.getLeaders(newProps.category.name, strings.THIS_MONTH);
  },

  setTimeframe: function(e) {
    e.preventDefault();
    this.getLeaders(this.props.category.name, e.target.value);
  },

  getDate: function(timeframe) {
    var date = new Date();
    switch(timeframe) {
      case strings.THIS_YEAR:
        date.setYear(date.getYear()-1);
        break;

      case strings.THIS_MONTH:
        date.setMonth(date.getMonth()-1);
        break;

      case strings.THIS_WEEK:
        date.setDate(date.getDate()-7);
        break;

      case strings.TODAY:
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
    var rank, leader;
    var length = this.state.leaders.length;
    for (var i = 0; i < length; i++) {
      leader = this.state.leaders[i];
      for (var j = 0; j < leader.categories.length; j++) {
        if (leader.categories[j].name.toLowerCase() === this.props.category.name.toLowerCase()) {
          rank = leader.categories[j].rank + ' / ' + this.props.category.experts;
          break;
        }
      }

      // Provide the investment button unless the user is yourself
      var button = '';
      if (this.props.currentUser._id !== leader._id) {
        console.log('redoing investment button for trending');
        button =
          <div className="leader-table-invest">
            <MiniInvestButton currentUser={this.props.currentUser} userId={leader._id} />
          </div>;
      }

      leaderRows.push(
        <tr key={leader._id}>
          <td>
            <Link to="profile" params={{userId: leader._id}}>{leader.username}</Link>
            {button}
          </td>
          <td>{rank}</td>
        </tr>
      );
    }
    return leaderRows;
  },

  render: function() {
    var leaders = this.getLeaderRows();
    var title = strings.TRENDING_EXPERTS;
    return (
      <div className="panel panel-default trending-table">
        <table className="table table-bordered">
          <thead>
          <tr>
            <th colSpan="3">
              <div className="trending-table-title">{title}</div>
              <select onChange={this.setTimeframe}>
                <option>{strings.THIS_MONTH}</option>
                <option>{strings.THIS_WEEK}</option>
                <option>{strings.TODAY}</option>
                <option>{strings.THIS_YEAR}</option>
              </select>
            </th>
          </tr>
          <tr>
            <th>{strings.NAME}</th>
            <th>{strings.RANK}</th>
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
