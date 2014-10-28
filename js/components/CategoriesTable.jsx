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
        <CategoriesHeader user={this.props.user} />
        <table className="table table-bordered table-striped">
          <tr>
            <th>Category</th>
            <th>Direct Rep</th>
            <th>Crowd Rep</th>
          </tr>
          <tbody>
          {this.props.user.categories.map(function(category) {
            return <CategoriesItem category={category.name} directRep={category.directScore} prevDirectRep={category.previousDirectScore} crowdRep={category.crowdScore} />;
          })}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = CategoriesTable;
