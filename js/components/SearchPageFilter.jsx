'use strict';
var React = require('react');

var SearchPageFilter = React.createClass({
  applyFilter: function() {
    this.props.filterResults({
      user: $('.user-checkbox').is(':checked'),
      category: $('.category-checkbox').is(':checked'),
    });
  },

  render: function() {
    return (
      <div className="searchPageFilter panel panel-info">
        <div className="panel-heading">
          <h5>Filter by</h5>
        </div>
        <div className="panel-body">
          <div className="checkbox" onChange={this.applyFilter}>
            <label>
              <input type="checkbox" className="user-checkbox"> User </input>
            </label>
          </div>
          <div className="checkbox" onChange={this.applyFilter}>
            <label>
              <input type="checkbox" className="category-checkbox"> Category </input>
            </label>
          </div>
        </div>
      </div>
    );
  },
});

module.exports = SearchPageFilter;
