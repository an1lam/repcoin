/** @jsx React.DOM */
"use strict";

var Router = require('react-router');
var React = require('react');
var Link = Router.Link;

var FeedItem = React.createClass({
  render: function() {
    if (this.props.from) {
      var from = <p><Link className="fromName" to="profile" params={{userId: this.props.from.id}}>
                   {this.props.from.name}</Link><p>gave</p></p>;
    } else {
      //TODO: Make this not appear only on one line
      var from = <p>Anonymous gave</p>;
    }
    return (
      <div className="feedItem">
        {from}
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
