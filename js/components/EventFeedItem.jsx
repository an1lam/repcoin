'use strict';

var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var EventFeedItem = React.createClass({

  render: function() {
    var from;
    if (this.props.event.type === 'join') {
      from = <Link className='fromName' to='profile' params={{userId: this.props.event.userId}}>
              {this.props.event.name}</Link>;
    }
    return (
      <div className='feedItem eventFeedItem'>
        {from} just joined Repcoin!
      </div>
    )
   },
});

module.exports = EventFeedItem;
