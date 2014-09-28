/** @jsx React.DOM */
"use strict";

var React = require('react');
var FeedItem = require('./FeedItem.jsx');
var FeedHeader = require('./FeedHeader.jsx');

var mockDonor = {
  "id": "123",
  "name": "Stephen Malina"
};

var mockDonor2 = {
  "id": "123",
  "name": "Will Baird"
};

var mockDonor3 = {
  "id": "284",
  "name": "Taylor Malmsheimer"
};

var mockReceiver = {
  "id": "456",
  "name": "Matt Ritter"
};

var mockReceiver2 = {
  "id": "999",
  "name": "Andrew Lindner"
};

var mockReceiver3 = {
  "id": "133",
  "name": "Aaron Lewin"
};


var mockAmount = 100;
var mockAmount2 = 200;
var mockAmount3 = 987;

var mockCategory = "Coding";
var mockCategory2 = "Reading";
var mockCategory3 = "Skiing";

var mockFeedItems = [
  {
    "donor": mockDonor,
    "receiver": mockReceiver,
    "amount": mockAmount,
    "category": mockCategory
  },
  {
    "donor": mockDonor2,
    "receiver": mockReceiver2,
    "amount": mockAmount2,
    "category": mockCategory2
  },
  {
    "donor": mockDonor3,
    "receiver": mockReceiver3,
    "amount": mockAmount3,
    "category": mockCategory3
  }
];

var Feed = React.createClass({
  // TODO (ritterm): Feed should eventually take some kind of user in props
  // TODO (ritterm): Feed should not call fake data in initial function 
  getIntialState: function() {
    return { feedItems: [] };
  },

  componentDidMount: function() {
    this.setState({ feedItems: mockFeedItems });
  },

  generateFeedItems: function() {
    if (!this.state) {
      return;
    }

    var feedItems = this.state.feedItems.map(function(feedItem) {
      return (
        <li className="list-group-item"><FeedItem donor={feedItem.donor} receiver={feedItem.receiver} amount={feedItem.amount} category={feedItem.category} /></li>
      );
    });

    return feedItems;
  },

  render: function() {
    return (
      <div className="feed">
        <FeedHeader />
        <ul className="list-group">
          {this.generateFeedItems()}
        </ul>
      </div>
    );
  }
});

module.exports = Feed;
