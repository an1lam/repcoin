'use strict';

var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var EventFeedItem = React.createClass({

  render: function() {
    var event;
    var date = new Date(this.props.event.timeStamp);
    var month = date.getMonth() + 1;
    var dateFormat = month + '\/' + date.getDate() + '\/' + date.getFullYear();

    if (this.props.event.type === 'join') {
      event = <span><Link className='userName' to='profile' params={{userId: this.props.event.userId}}>
              {this.props.event.name}</Link> just joined Repcoin!</span>;
    }
    return (
      <div className='feedItem event-feed-item'>
        {event}
        <span className="timestamp-badge badge">{dateFormat}</span>
      </div>
    )
   },
});

module.exports = EventFeedItem;
