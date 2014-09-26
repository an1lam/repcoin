/** @jsx React.DOM */
"use strict";

var React = require('react');

var CategoriesHeader = React.createClass({
  render: function() {
    return (
      <tr className="categoriesHeader">
        <th>{this.props.category}</th>
        <th>{this.props.directRep}</th>
        <th>{this.props.crowdRep}</th>
      </tr>
    );
  }
});

module.exports = CategoriesHeader;
