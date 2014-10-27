/** @jsx React.DOM */
"use strict";

var React = require('react');

var CategoriesHeader = React.createClass({
  render: function() {
    return (
      <div className="categoriesHeader">
        <strong>{this.props.user.username + '\'s Categories'}</strong>
      </div>
    );
  }
});

module.exports = CategoriesHeader;
