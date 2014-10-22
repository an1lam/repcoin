/** @jsx React.DOM */
"use strict";

var React = require('react');
var CategoriesItem = require('./CategoriesItem');
var CategoriesHeader = require('./CategoriesHeader');
var $ = require('jquery');

var CategoriesTable = React.createClass({

  render: function() {
    return (
      <div className="categoriesTable panel panel-default">
        <table className="table table-bordered table-striped">
          <CategoriesHeader category="Category" directRep="Direct Rep" crowdRep="Crowd Rep" />
          <tbody>
          {this.props.categories.map(function(category) {
            return <CategoriesItem category={category.name} directRep={category.directScore} crowdRep={category.crowdScore} />;
          })}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = CategoriesTable;
