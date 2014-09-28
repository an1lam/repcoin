/** @jsx React.DOM */
"use strict";

var React = require('react');
var Feed = require('./Feed.jsx');

var FeedHeader = React.createClass({
  render: function() {
    return (
      <div className = "feedHeader btn-group">
        <button type="button" className="btn btn-default">All</button>
        <button type="button" className="btn btn-default">To</button>
        <button type="button" className="btn btn-default">From</button>
        <button type="button" className="btn btn-default">Us</button>
      </div>
    );
  }
});

module.exports = FeedHeader;

