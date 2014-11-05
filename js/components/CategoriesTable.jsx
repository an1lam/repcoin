/** @jsx React.DOM */
"use strict";

var auth = require('../auth.jsx');
var React = require('react');
var CategoriesItem = require('./CategoriesItem');
var CategoriesHeader = require('./CategoriesHeader');
var $ = require('jquery');

var CategoriesTable = React.createClass({
  render: function() {
    var toIncludeReps = false;
    var repsHeader = '';
    if (this.props.currentUser.username === this.props.user.username) {
        toIncludeReps = true;
        repsHeader = <th>Reps</th>;
    }

    return (
      <div className="categoriesTable panel panel-default">
        <CategoriesHeader user={this.props.user} />
        <table className="table table-bordered table-striped">
          <tr>
            <th>Category</th>
            <th>Direct Rep</th>
            <th>Crowd Rep</th>
            {repsHeader}
          </tr>
          <tbody>
          {this.props.user.categories.map(function(category) {
            if (toIncludeReps) {
              return <CategoriesItem key={category.id} category={category.name} directRep={category.directScore} prevDirectRep={category.previousDirectScore} crowdRep={category.crowdScore} reps={category.reps} />;
            } else {
              return <CategoriesItem key={category.id} category={category.name} directRep={category.directScore} prevDirectRep={category.previousDirectScore} crowdRep={category.crowdScore} />;
            }
          })}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = CategoriesTable;
