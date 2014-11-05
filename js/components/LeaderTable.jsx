/** @jsx React.DOM */
"use strict";

var Router = require('react-router');

var $ = require('jquery');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var Link = Router.Link;
var React = require('react');

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
    $.ajax({
      url: url,
      success: function(leaders) {
        this.setState({ leaders: leaders });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.params.category, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    var leaders = '';
    leaders = this.state.leaders.map(function(leader) {
      var directScore, crowdScore;
      for (var i = 0; i < leader.categories.length; i++) {
        if (leader.categories[i].name.toLowerCase() === this.props.category.toLowerCase()) {
          directScore = leader.categories[i].directScore;
          crowdScore = leader.categories[i].crowdScore;
        }
      }
return <tr key={leader._id} >
  <td><Link to="profile" params={{userId: leader._id}}>{leader.username}</Link></td>
        <td>{directScore}</td>
        <td>{crowdScore}</td>
      </tr>;
    }.bind(this));
    return (
      <table className="table table-bordered">
        <thead>
        <tr><th colSpan="3">{this.props.category} Leaders</th></tr>
        <tr>
          <th>Name</th>
          <th>Direct Rep</th>
          <th>Crowd Rep</th>
        </tr>
        </thead>
        <tbody>
          {leaders}
        </tbody>
      </table>
    );
  }
});

module.exports = LeaderTable;
