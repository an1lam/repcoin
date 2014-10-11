/** @jsx React.DOM */
"use strict";

var React = require('react');
var FeedItem = require('./FeedItem.jsx');
var FeedHeader = require('./FeedHeader.jsx');
var $ = require('jquery');
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
    "from": mockDonor,
    "to": mockReceiver,
    "amount": mockAmount,
    "category": mockCategory
  },
  {
    "from": mockDonor2,
    "to": mockReceiver2,
    "amount": mockAmount2,
    "category": mockCategory2
  },
  {
    "from": mockDonor3,
    "to": mockReceiver3,
    "amount": mockAmount3,
    "category": mockCategory3
  }
];

var Feed = React.createClass({
  getIntialState: function() {
    return { feedItems: [] };
  },

  componentDidMount: function() {
    // TODO: Pagination?
    $.ajax({
      url: '/api/transactions',
      dataType: 'json',
      success: function(transactions) {
        this.setState({ feedItems: transactions });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });

  },

  generateFeedItems: function() {
    if (!this.state) {
      return;
    }

    var feedItems = this.state.feedItems.map(function(feedItem) {
      return (
        <li className="list-group-item"><FeedItem from={feedItem.from} to={feedItem.to} amount={feedItem.amount} category={feedItem.category} /></li>
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
