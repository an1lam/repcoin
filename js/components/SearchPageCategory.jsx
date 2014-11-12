"use strict";

var React = require('react');

var SearchPageCategory = React.createClass({
  render: function() {
    return (
      <div className="searchPageItem searchPageCategory">{this.props.category.name}</div>
    );
  }
});

module.exports = SearchPageCategory;
