/** @jsx React.DOM */
"use strict";

var React = require('react');
var FeedItem = require('./FeedItem.jsx');
var FeedHeader = require('./FeedHeader.jsx');

var mockDonor = {
  "id": "123",
  "name": "Stephen Malina"
};

var mockReceiver = {
  "id": "456",
  "name": "Matt Ritter"
};

var mockAmount = 100;

var mockCategory = "Coding";

var Feed = React.createClass({
  render: function() {
    return (
      <div className="feed">
        <FeedHeader />
        <FeedItem donor={mockDonor} receiver={mockReceiver} amount={mockAmount} category={mockCategory} />
      </div>
    );
  }
});

module.exports = Feed;
