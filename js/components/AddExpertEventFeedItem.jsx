'use strict';

var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var strings = require('../lib/strings_utils.js');

var AddExpertEventFeedItem = React.createClass({
  getInitialState: function() {
    return {
      img: strings.DEFAULT_USER_PIC
    };
  },

  componentDidMount: function() {
    this.getUserPicture(this.props.event.userId);
  },

  componentWillReceiveProps: function(newProps) {
    this.getUserPicture(newProps.event.userId);
  },

  getUserPicture: function(userId) {
    var url = '/api/users/' + userId;
    $.ajax({
      url: url,
      type: 'GET',
      success: function(user) {
        if (this.isMounted()) {
          if (user.picture && user.picture.url) {
            this.setState({ img: user.picture.url });
          }
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    var event;
    var img;
    var imgClass = 'event-item-img 0' + this.props.event._id;
    var date = new Date(this.props.event.timeStamp);
    var month = date.getMonth() + 1;
    var dateFormat = month + '\/' + date.getDate() + '\/' + date.getFullYear();

    img = <img className={imgClass} src={this.state.img}></img>
    event =
      <span>
        <Link to='profile' params={{userId: this.props.event.userId}}>
            {this.props.event.username}</Link> became an expert in <Link to="category" params={{category: this.props.event.category}}>
          '{this.props.event.category}'</Link>!</span>;
    return (
      <div className='feedItem event-feed-item'>
        {img}
        {event}
        <span className="timestamp-badge badge">{dateFormat}</span>
      </div>
    )
  }

});

module.exports = AddExpertEventFeedItem;
