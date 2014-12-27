'use strict';

var React = require('react');
var Category = require('./Category.jsx');

var CategoriesList = React.createClass({
  render: function() {
    return (
      <div className="categoriesList container-fluid">
        {this.generateCategories()}
      </div>
    );
  },

  generateCategories: function() {
    var categories = this.props.categories.map(function(category) {
      return (
        // TODO : Style the categories with color somehow (background, text, etc)
        <div key={category.name}>
          <Category category={category.name} />
        </div>
      );
    });

    return categories;
  }
});

module.exports = CategoriesList;
