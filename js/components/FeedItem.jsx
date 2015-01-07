"use strict";

var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var FeedItem = React.createClass({

  componentDidMount: function() {
    var color = this.props.transaction.amount < 0 ? "#BD362F" : "#51A351";
    $("." + this.props.transaction._id).css("color", color);
  },

  render: function() {
    var from;
    if (!this.props.transaction.from.anonymous) {
      from = <Link className="fromName" to="profile" params={{userId: this.props.transaction.from.id}}>
                   {this.props.transaction.from.name}</Link>;
    } else {
      from = <p className="fromName">Someone</p>;
    }

    var a = this.props.transaction.amount;
    var action = a < 0 ? "revoked" : "gave";
    var amount = a < 0 ? a * -1 : a;
    var repsPronoun = a < 0 ? "reps from" : "reps to";

    var classes = "action " + this.props.transaction._id;
    return (
      <div className="feedItem">
        {from}
        <strong className={classes}>{action}</strong>
      	<p className="amount">{amount}</p>
      	<p className="repsPronoun">{repsPronoun}</p>
        <Link className="toName" to="profile" params={{userId: this.props.transaction.to.id}}>{this.props.transaction.to.name}</Link>
        <p className="for">for</p>
      	<Link className="category" to="category" params={{category: this.props.transaction.category}}>{this.props.transaction.category}</Link>
      	<p className="period">.</p>
      </div>
    );
  }
});

module.exports = FeedItem;
