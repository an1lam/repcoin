'use strict';

var $ = require('jquery');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var LeaderTable = React.createClass({
  getInitialState: function() {
    return {leaders: []};
  },

  componentDidMount: function() {
    this.setLeaders(this.props.category);
  },

  componentWillReceiveProps: function(newProps) {
    this.setLeaders(newProps.category);
  },

  setLeaders: function(category) {
    var url = '/api/users/' + category + '/leaders/10';
    var expert = this.props.expert ? 1 : 0;
    var data = { expert: expert };
    $.ajax({
      url: url,
      data: data,
      success: function(leaders) {
        this.setState({ leaders: leaders });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.params.category, status, err.toString());
      }.bind(this)
    });
  },

  getLeaderRows: function() {
    var leaderRows = [];
    var percentile, leader;
    var length = this.state.leaders.length;
    for (var i = 0; i < length; i++) {
      leader = this.state.leaders[i];
      if (this.props.expert) {
        for (var j = 0; j < leader.categories.length; j++) {
          if (leader.categories[j].name.toLowerCase() === this.props.category.toLowerCase()) {
            percentile = leader.categories[j].percentile;
            break;
          }
        }
      } else {
        for (var j = 0; j < leader.portfolio.length; j++) {
          if (leader.portfolio[j].category.toLowerCase() === this.props.category.toLowerCase()) {
            percentile = leader.portfolio[j].percentile;
            break;
          }
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
    var title = this.props.expert ? 'Leading Experts' : 'Leading Investors';
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

module.exports = LeaderTable;
