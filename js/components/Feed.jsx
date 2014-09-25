/** @jsx React.DOM */
"use strict";

var React = require('react');
var FeedItem = require('./FeedItem.jsx');
var FeedHeader = require('./FeedHeader.jsx');
var Feed = React.createClass({
  render: function() {
    return (
      <div className="feed">
        <FeedHeader />
        <FeedItem transaction="Johnny gave Stephen 100 reps for coding." />
        <FeedItem transaction="Bill gave Will 32 reps for dance." />
        <FeedItem transaction="Jane gave Bob 41 reps for reading." />
      </div>
    );
  }
});

module.exports = Feed;
