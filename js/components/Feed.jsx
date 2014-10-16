/** @jsx React.DOM */
"use strict";

var React = require('react');
var FeedItem = require('./FeedItem.jsx');
var FeedHeader = require('./FeedHeader.jsx');
var $ = require('jquery');

var Feed = React.createClass({
  getInitialState: function() {
    return { transactions: [], filter: "all" };
  },

  componentDidMount: function() {
    this.setTransactions(this.props.userId, this.props.filter); 
  },

  setTransactions: function(userId, filter) {
    // TODO : paginations
    var url;
    if (!userId) {
      url = '/api/transactions';
    } else {
      url = '/api/transactions/users/' + userId + '/' + filter + '/public';
    }

    $.ajax({
      url: url,
      dataType: 'json',
      success: function(transactions) {
        this.setState({ transactions : transactions, filter: filter });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  componentWillReceiveProps: function(newProps) {
    this.setTransactions(newProps.userId, newProps.filter);
  },

  handleClick: function(newFilter) {
    this.setState({ filter: newFilter });
    this.setTransactions(this.props.userId, newFilter);
  },

  render: function() {
    return (
      <div className="feed">
        <FeedHeader onClick={this.handleClick}/>
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
