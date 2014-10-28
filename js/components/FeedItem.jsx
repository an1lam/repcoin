/** @jsx React.DOM */
"use strict";

var Router = require('react-router');
var React = require('react');
var Link = Router.Link;
var $ = require('jquery');

var FeedItem = React.createClass({
  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
    var color = this.props.amount < 0 ? "#BD362F" : "#51A351";
    $(".gave").css("color", color);
  },

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
        <strong className="gave">gave</strong>
        <Link className="toName" to="profile" params={{userId: this.props.to.id}}>{this.props.to.name}</Link>
      	<p className="amount">{this.props.amount}</p>
      	<p className="repsFor">reps for</p>
      	<Link className="category" to="category" params={{category: this.props.category}}>{this.props.category}</Link>
      	<p className="period">.</p>
      </div>
    );
  }
});

module.exports = FeedItem;
