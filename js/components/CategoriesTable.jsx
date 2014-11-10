/** @jsx React.DOM */
"use strict";

var auth = require('../auth.jsx');
var React = require('react');
var CategoriesItem = require('./CategoriesItem');
var CategoriesHeader = require('./CategoriesHeader');
var $ = require('jquery');

var CategoriesTable = React.createClass({
  render: function() {
    var includeReps = false;
    var repsHeader = '';
    if (this.props.currentUser.username === this.props.user.username) {
        includeReps = true;
        repsHeader = <th>Reps</th>;
    }

    return (
      <div key={this.props.user._id} className="categoriesTable panel panel-default">
        <CategoriesHeader user={this.props.user} />
        <table className="table table-bordered table-striped">
          <tbody>
            <tr>
              <th>Category</th>
              <th>Direct Rep</th>
              {repsHeader}
            </tr>
            {this.props.user.categories.map(function(category) {
              return <CategoriesItem key={category.id} category={category.name} directRep={category.directScore} prevDirectRep={category.previousDirectScore} reps={category.reps} includeReps={includeReps} />;
            })}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = CategoriesTable;
