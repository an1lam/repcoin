'use strict';

var auth = require('../auth.jsx');
var CategoryPanelExpert = require('./CategoryPanelExpert.jsx');
var CategoryPanelInvestor = require('./CategoryPanelInvestor.jsx');
var Feed = require('./Feed.jsx');
var React = require('react');

var CategoryDashboard = React.createClass({
  getInitialState: function() {
    return {
      currentUser: null,
      panel: 'Expert'
    };
  },

  componentDidMount: function() {
    this.resetCurrentUser();
  },

  resetCurrentUser: function() {
    auth.getCurrentUser.call(this, this.setCurrentUser);
  },

  setCurrentUser: function(currentUser) {
    this.setState({ currentUser: currentUser });
  },

  handleToggle: function(e) {
    var panel = e.target.value;
    this.setState({ panel: panel });
  },

  render: function() {
    if (this.state.currentUser) {
      var panel = '';
      switch(this.state.panel) {
        case 'Expert':
          panel =  <CategoryPanelExpert category={this.props.category} user={this.state.currentUser}/>;
          break;

        case 'Investor':
          panel =  <CategoryPanelInvestor category={this.props.category} user={this.state.currentUser}/>;
          break;

        case 'Feed':
          panel = <Feed category={this.props.category} parent="CategoryPage"/>;
          break;

        default:
          panel = <CategoryPanelExpert user={this.state.currentUser}/>;
          break;
      }
    }
    return (
      <div className="category-dashboard">
        <div className="dashboard-buttons">
          <button className="btn btn-default" onClick={this.handleToggle} value="Expert">Expert</button>
          <button className="btn btn-default" onClick={this.handleToggle} value="Investor">Investor</button>
          <button className="btn btn-default" onClick={this.handleToggle} value="Feed">Feed</button>
        </div>
        {panel}
      </div>
    )
  }
});

module.exports = CategoryDashboard;
