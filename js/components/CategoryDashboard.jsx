'use strict';
var CategoryPanelExpert = require('./CategoryPanelExpert.jsx');
var CategoryPanelInvestor = require('./CategoryPanelInvestor.jsx');
var Feed = require('./Feed.jsx');
var React = require('react');

var CategoryDashboard = React.createClass({
  getInitialState: function() {
    return {
      panel: 'Expert'
    };
  },

  handleToggle: function(e) {
    var panel = e.target.value;
    this.setState({ panel: panel });
  },

  render: function() {
    var panel = '';
    switch (this.state.panel) {
      case 'Expert':
        panel =  <CategoryPanelExpert category={this.props.category} user={this.props.currentUser}/>;
        break;

      case 'Investor':
        panel =  <CategoryPanelInvestor category={this.props.category} user={this.props.currentUser}/>;
        break;

      case 'Feed':
        panel = <Feed category={this.props.category} parent="CategoryPage"/>;
        break;

      default:
        panel = <CategoryPanelExpert user={this.props.currentUser}/>;
        break;
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
