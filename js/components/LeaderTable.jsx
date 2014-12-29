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

  render: function() {
    var leaders = '';
    leaders = this.state.leaders.map(function(leader) {
      var percentile;
      for (var i = 0; i < leader.categories.length; i++) {
        if (leader.categories[i].name.toLowerCase() === this.props.category.toLowerCase()) {
          percentile = leader.categories[i].percentile;
        }
      }
return <tr key={leader._id} >
  <td><Link to="profile" params={{userId: leader._id}}>{leader.username}</Link></td>
        <td>{percentile}</td>
      </tr>;
    }.bind(this));
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
