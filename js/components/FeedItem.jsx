/** @jsx React.DOM */
"use strict";

var Router = require('react-router');
var React = require('react');
var Link = Router.Link;

var FeedItem = React.createClass({
  render: function() {
    var from;
    if (this.props.from.id) {
      from = <p><Link className="fromName" to="profile" params={{userId: this.props.from.id}}>
                   {this.props.from.name}</Link><p>gave</p></p>;
    } else {
      from = <p className="fromName">{this.props.from.name} gave</p>;
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
