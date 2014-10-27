/** @jsx React.DOM */
"use strict";

var React = require('react');

var CategoriesHeader = React.createClass({
  render: function() {
    return (
      <div className="categoriesHeader">
        <div className="categoriesTitle">
          <strong>{this.props.user.username + '\'s Categories'}</strong>
        </div>
        <tr>
          <th>{this.props.category}</th>
          <th>{this.props.directRep}</th>
          <th>{this.props.crowdRep}</th>
        </tr>
      </div>
    );
  }
});

module.exports = CategoriesHeader;
