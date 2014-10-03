/** @jsx React.DOM */
"use strict";

var React = require('react');
var CategoriesItem = require('./CategoriesItem');
var CategoriesHeader = require('./CategoriesHeader');

var CategoriesTable = React.createClass({
  render: function() {
    return (
      <div className="categoriesTable panel panel-default">
        <table className="table table-bordered table-striped">
          <CategoriesHeader category="Category" directRep="Direct Rep" crowdRep="Crowd Rep" />
          <CategoriesItem category="Jazz" directRep="1024" crowdRep="1.7"/>
          <CategoriesItem category="Coding" directRep="110" crowdRep="1.3" />
          <CategoriesItem category="Skiing" directRep="304" crowdRep="0.7" />
        </table>
      </div>
    );
  }
});

module.exports = CategoriesTable;
