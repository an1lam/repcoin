/** @jsx React.DOM */
"use strict";

var Router = require('react-router');
var React = require('react');
var Link = Router.Link;

var FeedItem = React.createClass({
  render: function() {
    return (
      <div className="feedItem">
      	<Link className="donorName" to="profile" params={{userId: this.props.donor.id}}>{this.props.donor.name}</Link>
      	<p className="gave">gave</p>
      	<Link className="receiverName" to="profile" params={{userId: this.props.receiver.id}}>{this.props.receiver.name}</Link>
      	<p className="amount">{this.props.amount}</p>
      	<p className="repsFor">reps for</p>
      	<p className="category">{this.props.category}</p>
      	<p className="period">.</p>
      </div>
    );
  }
});

module.exports = FeedItem;
