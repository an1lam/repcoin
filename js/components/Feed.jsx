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
    this.setTransactions(); 
  },

  generateUrl: function() {
    var url;
    if (this.props.parent === "ProfilePage") {
      url = '/api/transactions/users/' + this.props.userId + '/' + this.state.filter + '/public';
    } else if (this.props.parent === "HomePage") {
      url = '/api/transactions';
    } else if (this.props.parent === "CategoryPage") {
      url = '/api/transactions/categories/' + this.props.category;
    }
    return url;
  },

  setTransactions: function() {
    var url = this.generateUrl();
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
  },

  componentWillUpdate: function() {
    this.setTransactions();
  },

  handleClick: function(newFilter) {
    this.setState({ filter: newFilter });
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
