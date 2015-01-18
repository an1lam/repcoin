'use strict';

var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var strings = require('../lib/strings_utils.js');
var Link = Router.Link;

var FeedItem = React.createClass({
  getInitialState: function() {
    return {
      fromUser: null,
      toUser: null
    };
  },

  componentDidMount: function() {
    var color = this.props.transaction.amount < 0 ? "#BD362F" : "#51A351";
    $("." + this.props.transaction._id).css("color", color);

    this.getUser(this.props.transaction.from.id, function(user) {
      if (user) {
        this.setState({ fromUser: user });
      }
    }.bind(this));
    this.getUser(this.props.transaction.to.id, function(user) {
      if (user) {
        this.setState({ toUser: user });
      }
    }.bind(this));
  },

  getUser: function(userId, cb) {
    var url = '/api/users/' + userId;
    $.ajax({
      url: url,
      success: function(user) {
        cb(user);
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(xhr.responseText);
        cb(null);
      }.bind(this)
    });
  },

  render: function() {
    var from, fromImg;
    if (!this.props.transaction.from.anonymous) {
      from = <Link className="fromName" to="profile" params={{userId: this.props.transaction.from.id}}>
                   {this.props.transaction.from.name}</Link>;
      // Get the img for the to user
      var img1Class = 'feed-item-img 0 ' + this.props.transaction._id;
      var img1Url = strings.DEFAULT_USER_PIC;
      var fromUser = this.state.fromUser;
      if (fromUser && fromUser.picture && fromUser.picture.url) {
        img1Url = fromUser.picture.url;
      }
      fromImg = <img className={img1Class} src={img1Url}></img>;
    } else {
      from = <p className="fromName">Someone</p>;
      fromImg = '';
    }

    var a = this.props.transaction.amount;
    var action = a < 0 ? 'revoked' : 'gave';
    var amount = a < 0 ? a * -1 : a;
    var repsPronoun = a < 0 ? 'reps from' : 'reps to';

    var date = new Date(this.props.transaction.timeStamp);
    var month = date.getMonth() + 1;
    var dateFormat = month + '\/' + date.getDate() + '\/' + date.getFullYear();
    var classes = 'action ' + this.props.transaction._id;

    // Get the img for to user
    var img2Class = 'feed-item-img 1 ' + this.props.transaction._id;
    var img2Url = strings.DEFAULT_USER_PIC;
    var toUser = this.state.toUser;
    if (toUser && toUser.picture && toUser.picture.url) {
      img2Url = toUser.picture.url;
    }

    return (
      <div className="feedItem">
        {from}
        {fromImg}
        <strong className={classes}>{action}</strong>
      	<p className="amount">{amount}</p>
      	<p className="repsPronoun">{repsPronoun}</p>
        <Link className="toName" to="profile" params={{userId: this.props.transaction.to.id}}>{this.props.transaction.to.name}</Link>
        <img className={img2Class} src={img2Url}></img>
        <p className="for">for</p>
      	<Link className="category" to="category" params={{category: this.props.transaction.category}}>{this.props.transaction.category}</Link>
      	<p className="period">.</p>
        <span className="timestamp-badge badge">{dateFormat}</span>
      </div>
    );
  }
});

module.exports = FeedItem;
