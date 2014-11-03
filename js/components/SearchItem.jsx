"use strict";

var React = require('react');

var SearchItem = React.createClass({
  render: function() {
    return (
      <div className="searchItem">{this.props.datum.username}</div>
    );
  }
});

module.exports = SearchItem;
