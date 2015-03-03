'use strict';

var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var strings = require('../lib/strings_utils.js');

var LeaderTable = React.createClass({
  getInitialState: function() {
    return { leaders: [] };
  },

  componentDidMount: function() {
    this.setLeaders(this.props.category.name);
  },

  componentWillReceiveProps: function(newProps) {
    this.setLeaders(newProps.category.name);
  },

  setLeaders: function(category) {
    var url = '/api/users/' + category + '/leaders';
    var expert = this.props.expert ? 1 : 0;
    var data = { expert: expert };
    $.ajax({
      url: url,
      data: data,
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
    var rank, leader, size;
    var length = this.state.leaders.length;
    for (var i = 0; i < length; i++) {
      leader = this.state.leaders[i];
      if (this.props.expert) {
        rank = leader.categories.rank;
        size = this.props.category.experts;
      } else {
        rank = leader.portfolio.rank;
        size = this.props.category.investors;
      }
      leaderRows.push(
        <tr key={leader._id}>
          <td><Link to="profile" params={{userId: leader._id}}>{leader.username}</Link></td>
          <td>{rank} / {size}</td>
        </tr>
      );
    }
    return leaderRows;
  },

  render: function() {
    var leaders = this.getLeaderRows();
    var title = this.props.expert ? strings.LEADING_EXPERTS : strings.LEADING_INVESTORS;
    return (
      <div className="panel panel-default">
        <table className="table table-bordered">
          <thead>
          <tr><th colSpan="3">{title}</th></tr>
          <tr>
            <th>Name</th>
            <th>Rank</th>
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

module.exports = LeaderTable;
