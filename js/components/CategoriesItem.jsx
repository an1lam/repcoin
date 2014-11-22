"use strict";

var InvestorList = require('./InvestorList.jsx');
var React = require('react');
var ScoreBar = require('./ScoreBar.jsx');

var CategoriesItem = React.createClass({

  render: function() {
    var reps = this.props.includeReps ? (<td>{this.props.category.reps}</td>) : '';

    return (
      <tr className="categoriesItem">
        <td>{this.props.category.name}</td>
        <td><ScoreBar directRep={this.props.category.directScore} prevDirectRep={this.props.category.previousDirectScore} category={this.props.category.name}/></td>
        <td><InvestorList category={this.props.category}/></td>
        {reps}
      </tr>
    );
  }
});

module.exports = CategoriesItem;
