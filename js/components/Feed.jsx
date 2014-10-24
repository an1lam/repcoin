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
    this.setTransactions(this.state.filter); 
  },

  generateUrl: function(filter) {
    var url;
    switch(this.props.parent) {
      case "ProfilePage":
        url = '/api/transactions/users/' + this.props.userId + '/' + filter + '/public';
        break;
      case "CategoryPage":
        url = '/api/transactions/categories/' + this.props.category;
        break;
      case "HomePage":
        url = '/api/transactions';
        break;
      default:
        url = '';
        break;
    }
    return url;
  },

  setTransactions: function(filter) {
    var url = this.generateUrl(filter);
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
    this.setState({ filter: newProps.filter });
    this.setTransactions(newProps.filter);
  },

  handleClick: function(newFilter) {
    this.setState({ filter: newFilter });
    this.setTransactions(newFilter);
  },

  render: function() {
    var feedHeader = this.props.userId ? <FeedHeader onClick={this.handleClick}/> : '';
    return (
      <div className="feed">
        {feedHeader}
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
