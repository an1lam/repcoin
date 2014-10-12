/** @jsx React.DOM */
"use strict";

var React = require('react');
var FeedItem = require('./FeedItem.jsx');
var FeedHeader = require('./FeedHeader.jsx');
var $ = require('jquery');

var Feed = React.createClass({
  getInitialState: function() {
    return { transactions: [] };
  },

  componentDidMount: function() {
    // TODO: Pagination?
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(transactions) {
        this.setState({ transactions : transactions });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
      console.log(this.state.transactions);
    return (
      <div className="feed">
        <FeedHeader />
        <ul className="list-group">
          {this.state.transactions.map(function(transaction) {
            return <li className="list-group-item"><FeedItem from={transaction.from} to={transaction.to} amount={transaction.amount} category={transaction.category} /></li>;
          })}
        </ul>
      </div>
    );
  }
});

module.exports = Feed;
