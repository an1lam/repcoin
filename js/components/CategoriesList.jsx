/** @jsx React.DOM */
"use strict";

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
    var i = 0;
    var categories = this.props.categories.map(function(category) {
      return (
        <div>
          <Category category={category.title} quotes={category.quotes} />
        </div>
      );
    });

    return categories;
  }
});

module.exports = CategoriesList;
