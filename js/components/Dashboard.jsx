'use strict';

var Feed = require('./Feed.jsx');
var PanelAll = require('./PanelAll.jsx');
var PanelExpert = require('./PanelExpert.jsx');
var PanelInvestor = require('./PanelInvestor.jsx');
var React = require('react');

var Dashboard = React.createClass({
  getInitialState: function() {
    return {
      panel: 'All'
    };
  },

  handleToggle: function(e) {
    var panel = e.target.value;
    this.setState({ panel: panel });
  },

  render: function() {
    var panel = '';
    switch(this.state.panel) {
      case 'All':
        panel =  <PanelAll user={this.props.currentUser}/>;
        break;

      case 'Expert':
        panel = <PanelExpert user={this.props.currentUser}/>;
        break;

      case 'Investor':
        panel = <PanelInvestor user={this.props.currentUser}/>;
        break;

      case 'Feed':
        panel = <Feed parent="HomePage"/>;
        break;

      default:
        panel = <PanelExpert user={this.props.currentUser}/>;
        break;
    }
    return (
      <div className="dashboard">
        <div className="dashboard-buttons">
          <button className="btn btn-default" onClick={this.handleToggle} value="All">All</button>
          <button className="btn btn-default" onClick={this.handleToggle} value="Expert">Expert</button>
          <button className="btn btn-default" onClick={this.handleToggle} value="Investor">Investor</button>
          <button className="btn btn-default" onClick={this.handleToggle} value="Feed">Feed</button>
        </div>
        {panel}
      </div>
    )
  }
});

module.exports = Dashboard;
