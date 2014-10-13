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
    this.setTransactions(this.props.url); 
  },

  setTransactions: function(url) {
    // TODO : paginations
    $.ajax({
      url: url,
      dataType: 'json',
      success: function(transactions) {
        this.setState({ transactions : transactions });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  componentWillReceiveProps: function(newProps) {
    this.setTransactions(newProps.url);
  },

  render: function() {
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
