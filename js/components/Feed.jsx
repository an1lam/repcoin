'use strict';

var $ = require('jquery');
var FeedHeader = require('./FeedHeader.jsx');
var FeedItem = require('./FeedItem.jsx');
var EventFeedItem = require('./EventFeedItem.jsx');
var InvestmentButton = require('./InvestmentButton.jsx');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var PAGINATION_SIZE = 15;

var Feed = React.createClass({
  getInitialState: function() {
    return {
      transactions: [],
      filter: 'all',
      pagination: 0,
     };
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
        url = '/api/feedItems';
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

  getFeedItems: function() {
    var feedItems = [];
    var start = this.state.pagination;
    var end = start + PAGINATION_SIZE;
    var transactions = this.state.transactions;
    for (var i = start; i < end && i < transactions.length; i++) {
      // If it's a transaction
      if (transactions[i].amount) {
        feedItems.push(
          <li key={transactions[i]._id} className="list-group-item"><FeedItem transaction={transactions[i]} /></li>
        );

      // If it's an event
      } else {
        feedItems.push(
          <li key={transactions[i]._id} className="list-group-item"><EventFeedItem event={transactions[i]} /></li>
        );
      }
    }
    return feedItems;
  },

  showNewer: function(e) {
    e.preventDefault();
    if (this.state.pagination - PAGINATION_SIZE > -1) {
      this.setState({ pagination: this.state.pagination - PAGINATION_SIZE });
    }
  },

  showOlder: function(e) {
    e.preventDefault();
    if (this.state.pagination + PAGINATION_SIZE < this.state.transactions.length) {
      this.setState({ pagination: this.state.pagination + PAGINATION_SIZE });
    }
  },

  render: function() {
    var feedText = '';
    if (this.state.transactions.length === 0) {
      var text = strings.NO_TRANSACTIONS_FOUND;
      feedText = <div className="alert alert-warning no-transactions-warning">{text}</div>;
    }
    var feedItems = this.getFeedItems();
    var previousBtn = '';
    if (this.state.pagination + PAGINATION_SIZE < this.state.transactions.length) {
      previousBtn =
        <li className="previous">
          <a href="#" onClick={this.showOlder}><span aria-hidden="true">&larr;</span> Older</a>
        </li>;
    }
    var nextBtn = '';
    if (this.state.pagination - PAGINATION_SIZE > -1) {
      nextBtn =
        <li className="next">
            <a href="#" onClick={this.showNewer}>Newer <span aria-hidden="true">&rarr;</span></a>
        </li>;

    }
    return (
      <div key={this.props.userId} className="feed panel panel-default">
        <FeedHeader onClick={this.handleClick} isSelf={this.props.isSelf} parent={this.props.parent}/>
        <ul className="list-group">
          {feedItems}
        </ul>
        {feedText}
        <nav>
          <ul className="pager">
            {previousBtn}
            {nextBtn}
          </ul>
        </nav>
      </div>
    );
  }
});

module.exports = Feed;
