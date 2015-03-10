'use strict';

var GoogleColumnChart = require('./GoogleColumnChart.jsx');
var GoogleLineChart = require('./GoogleLineChart.jsx');
var React = require('react');
var PanelExpert = React.createClass({
  getInitialState: function() {
    return {
      selectedCategory: null,
      sortedCategories: [],
      newBy: false,
    };
  },

  componentDidMount: function() {
    if (this.props.user.categories.length > 0) {
      var sortedCategories = this.props.user.categories.sort(
        this.getCategoriesComparator());

      this.setState({
        selectedCategory: sortedCategories[0].name,
        sortedCategories: sortedCategories,
      });
    } else {
      this.setState({ newBy: true });
    }
  },

  getCategoriesComparator: function() {
    return function(a, b) {
      if (a.rank > b.rank) {
        return -1;
      }
      if (a.rank < b.rank) {
        return 1;
      }
      return 0;
    }
  },

  getCategoryOptions: function() {
    var categories = [];
    if (this.state.sortedCategories.length === 0) {
      return categories;
    }

    var name;
    for (var i = 0; i < this.state.sortedCategories.length; i++) {
      name = this.state.sortedCategories[i].name;
      categories.push(<option key={i} value={name}>{name}</option>);
    }
    return categories;
  },

  switchCategory: function(e) {
    this.setState({ selectedCategory: e.target.value });
  },

  render: function() {
    var content = '';
    var selectBox = '';

    // Show a special message for newbies
    if (this.state.newBy) {
      content =
        <div className="alert alert-info content">
          This panel will track progress on your expert categories. Join some categories to start seeing results!
        </div>;
    } else {
      selectBox =
        <select className="graph-switch form-control" onChange={this.switchCategory}>
          {this.getCategoryOptions()}
        </select>;

      if (!this.state.selectedCategory) {
        return (<div className="panel-all"></div>);
      }

      content =
        <div className="content">
          <div className="col-md-4">
            <GoogleLineChart user={this.props.user} category={this.state.selectedCategory} datatype='ranks' usertype='expert' />
          </div>
          <div className="col-md-4">
            <GoogleLineChart user={this.props.user} category={this.state.selectedCategory} datatype='reps' usertype='expert' />
          </div>
          <div className="col-md-4">
            <GoogleColumnChart user={this.props.user} category={this.state.selectedCategory} datatype='volume' usertype='expert' />
          </div>
        </div>;
    }
    return (
      <div className="panel-all">
        <div className="row panel-header">
          <div className="col-md-5">
            <h1>Expert Dashboard</h1>
            {selectBox}
          </div>
        </div>
        {content}
      </div>
    )
  }
});

module.exports = PanelExpert;
