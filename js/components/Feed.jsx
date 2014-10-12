/** @jsx React.DOM */
"use strict";

var React = require('react');
var FeedItem = require('./FeedItem.jsx');
var FeedHeader = require('./FeedHeader.jsx');
var $ = require('jquery');

var Feed = React.createClass({
  getIntialState: function() {
    return { feedItems: [] };
  },

  componentDidMount: function() {
    // TODO: Pagination?
    $.ajax({
      url: this.props.url,
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
          { this.generateFeedItems() }
        </ul>
      </div>
    );
  }
});

module.exports = Feed;
