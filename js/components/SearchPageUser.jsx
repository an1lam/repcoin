"use strict";

var React = require('react');

var SearchPageUser = React.createClass({
  render: function() {
    return (
      <div className="searchPageItem searchPageUser">{this.props.user.username}</div>
    );
  }
});

module.exports = SearchPageUser;
