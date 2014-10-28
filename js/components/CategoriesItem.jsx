/** @jsx React.DOM */
"use strict";

var React = require('react');
var ScoreBar = require('./ScoreBar.jsx');

var CategoriesItem = React.createClass({
  render: function() {
    return (
      <tr className="categoriesItem">
        <td>{this.props.category}</td>
        <td><ScoreBar directRep={this.props.directRep} prevDirectRep={this.props.prevDirectRep} /></td>
        <td>{this.props.crowdRep}</td>
      </tr>
    );
  }
});

module.exports = CategoriesItem;
