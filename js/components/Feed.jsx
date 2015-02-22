'use strict';

var $ = require('jquery');
var AddExpertEventFeedItem = require('./AddExpertEventFeedItem.jsx');
var FeedHeader = require('./FeedHeader.jsx');
var FeedItem = require('./FeedItem.jsx');
var JoinFeedItem = require('./JoinFeedItem.jsx');
var NewCategoryFeedItem = require('./NewCategoryFeedItem.jsx');
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
      endOfResults: false,
     };
  },

  componentDidMount: function() {
    this.resetTransactions(this.props);
  },

  generateUrl: function(filter, timeStamp, category) {
    var url;
    switch(this.props.parent) {
      case "ProfilePage":
        url = '/api/transactions/users/' + this.props.userId + '/' + filter + '/public/' + timeStamp;
        break;
      case "CategoryPage":
        url = '/api/transactions/categories/' + category  + '/' + timeStamp;
        break;
      case "HomePage":
        url = '/api/feedItems/' + timeStamp;
        break;
      default:
        url = '';
        break;
    }
    return url;
  },

  // Given a new page, reset the pagination and transactions
  resetTransactions: function(props) {
    var url = this.generateUrl(props.filter, new Date(), props.category);
    $.ajax({
      url: url,
      dataType: 'json',
      success: function(transactions) {
        this.setState({ transactions : transactions.slice(0,15), pagination: 0 });

        // If we have less than the pagination size + 1, then there are no more pages to fetch
        if (transactions.length < PAGINATION_SIZE + 1) {
          this.setState({ endOfResults: true });
        } else {
          this.setState({ endOfResults: false });
        }

      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  getTransactions: function(filter, timeStamp, category) {
    var url = this.generateUrl(filter, timeStamp, category);
    $.ajax({
      url: url,
      dataType: 'json',
      success: function(transactions) {
        // Concatenate the new transactions with the old ones found
        this.setState({ transactions : this.state.transactions.concat(transactions.slice(0,15)) });

        // If we have less than the pagination size + 1, then there are no more pages to fetch
        if (transactions.length < PAGINATION_SIZE + 1) {
          this.setState({ endOfResults: true });
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  componentWillReceiveProps: function(newProps) {
    this.setState({ filter: newProps.filter });
    this.resetTransactions(newProps);
  },

  // Handle clicking the filter buttons on the Profile Page Feed
  handleClick: function(newFilter) {
    this.setState({ filter: newFilter });
    var data = { filter: newFilter, date: new Date(), category: this.props.category };
    this.resetTransactions(data);
  },

  getFeedItems: function() {
    var feedItems = [];
    var start = this.state.pagination;
    var end = start + PAGINATION_SIZE;
    var transactions = this.state.transactions;
    var curr;

    for (var i = start; i < end && i < transactions.length; i++) {
      curr = transactions[i];

      // Transaction
      if (curr.amount) {
        feedItems.push(
          <li key={curr._id} className="list-group-item"><FeedItem transaction={curr} /></li>
        );

      // If the event is a transaction without a type, ignore it
      } else if (!curr.type) {
        continue;

      // Join event
      } else if (curr.type === 'join') {
        feedItems.push(
          <li key={curr._id} className="list-group-item"><JoinFeedItem event={curr} /></li>
        );
      } else if (curr.type === 'newcategory') {
        feedItems.push(
          <li key={curr._id} className="list-group-item"><NewCategoryFeedItem event={curr} /></li>
        );
      } else if (curr.type === 'addexpert') {
        feedItems.push(
          <li key={curr._id} className="list-group-item"><AddExpertEventFeedItem event={curr} /></li>
        );
      }
    }
    return feedItems;
  },

  // Show newer transactions
  // Simply go back to transactions that have already been fetched
  showNewer: function(e) {
    e.preventDefault();

    // If we can get any newer, decrement the pagination and reset endOfResults
    if (this.state.pagination - PAGINATION_SIZE > -1) {
      this.setState({ pagination: this.state.pagination - PAGINATION_SIZE, endOfResults: false });
    }
  },

  // Show older transactions
  // Increment paginations and fetch new transactions
  showOlder: function(e) {
    e.preventDefault();

    var newPagination = this.state.pagination + PAGINATION_SIZE;

    // If we're on the end of the pagination, we need to fetch more transactions
    if (this.state.pagination + PAGINATION_SIZE >= this.state.transactions.length) {
      // Get the date of the last transaction in the list
      // Set the new timestamp to one millisecond earlier than that
      var newTimeStamp = new Date(new Date(this.state.transactions[this.state.transactions.length-1].timeStamp)-1);
      this.getTransactions(this.state.filter, newTimeStamp, this.props.category);

    // Othwerwise, older transactions have already been fetched. Check whether or not the next page is the last
    } else {
      // If there are not PAGINATION_SIZE more transactions after this one, then we are at the end of the list
      if (newPagination + PAGINATION_SIZE >= this.state.transactions.length) {
        this.setState({ endOfResults: true });
      }
    }

    // Increment the pagination regardless of whether or not more transactions were fetched
    this.setState({ pagination: newPagination });
  },

  render: function() {
    var feedText = '';
    if (this.state.transactions.length === 0) {
      var text = strings.NO_TRANSACTIONS_FOUND;
      feedText = <div className="alert alert-warning no-transactions-warning">{text}</div>;
    }
    var feedItems = this.getFeedItems();

    // Determine whether or not to show the previous btn
    var previousBtn = '';
    if (!this.state.endOfResults) {
      previousBtn =
        <li className="previous">
          <a href="#" onClick={this.showOlder}><span aria-hidden="true">&larr;</span> Older</a>
        </li>;
    }

    // Determine whether or not to show the next btn
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
