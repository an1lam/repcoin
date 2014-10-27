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
        <CategoriesHeader user={this.props.user} category="Category" directRep="Direct Rep" crowdRep="Crowd Rep" />
        <table className="table table-bordered table-striped">
          <tr>
            <th>{this.props.category}</th>
            <th>{this.props.directRep}</th>
            <th>{this.props.crowdRep}</th>
          </tr>
          <tbody>
          {this.props.user.categories.map(function(category) {
            return <CategoriesItem category={category.name} directRep={category.directScore} crowdRep={category.crowdScore} />;
          })}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = CategoriesTable;
