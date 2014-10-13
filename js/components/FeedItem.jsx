/** @jsx React.DOM */
"use strict";

var Router = require('react-router');
var React = require('react');
var Link = Router.Link;

var FeedItem = React.createClass({
  render: function() {
    var from;
    if (!this.props.from.anonymous) {
      from = <Link className="fromName" to="profile" params={{userId: this.props.from.id}}>
                   {this.props.from.name}</Link>;
    } else {
      from = <p className="fromName">Someone</p>;
    }
    return (
      <div className="feedItem">
        {from}
        <p className="gave">gave</p>
        <Link className="toName" to="profile" params={{userId: this.props.to.id}}>{this.props.to.name}</Link>
      	<p className="amount">{this.props.amount}</p>
      	<p className="repsFor">reps for</p>
      	<p className="category">{this.props.category}</p>
      	<p className="period">.</p>
      </div>
    );
  }
});

module.exports = FeedItem;
