'use strict';
var React = require('react');

var CategoriesPageFilter = React.createClass({
  applySort: function(e) {
    this.props.sortResults(e.target.value);
  },

  render: function() {
    return (
      <div className="categoriesPageFilter">Sort by:
        <select onChange={this.applySort}>
          <option>Alphabetical</option>
          <option>Market Size (High to Low)</option>
          <option>Market Size (Low to High)</option>
        </select>
      </div>
    );
  },

});

module.exports = CategoriesPageFilter;

