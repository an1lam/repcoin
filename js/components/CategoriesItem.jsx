/** @jsx React.DOM */
"use strict";

var React = require('react');

var CategoriesItem = React.createClass({
  render: function() {
    return (
      <tr className="categoriesItem">
        <td>{this.props.category}</td>
        <td>{this.props.directRep}</td>
        <td>{this.props.crowdRep}</td>
      </tr>
    );
  }
});

module.exports = CategoriesItem;
