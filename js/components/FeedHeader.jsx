'use strict';

var Feed = require('./Feed.jsx');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var FeedHeader = React.createClass({

  componentDidMount: function() {
    this.setState({ filter: 'all' });
    $('.feed-info').popover({ trigger: 'hover focus' });
  },

  propagateClick: function(newFilter) {
    this.setState({ filter: newFilter });
    this.props.onClick(newFilter);
  },

  render: function() {
    var feedInfoContent = '';
    switch(this.props.parent) {
      case 'ProfilePage':
        feedInfoContent = strings.FEED_PROFILE_INFO_CONTENT;
        break;
      case 'CategoryPage':
        feedInfoContent = strings.FEED_CATEGORY_INFO_CONTENT;
        break;
      case 'HomePage':
        feedInfoContent = strings.FEED_INFO_CONTENT;
        break;
      default:
        feedInfoContent = strings.FEED_INFO_CONTENT;
        break;
    }

    var buttons = '';
    if (this.props.parent === 'ProfilePage') {
      if (this.props.isSelf) {
        buttons = <div className="btn-group">
          <button type="button" ref="All" value="all"  onClick={this.propagateClick.bind(this, "all")} className="btn btn-default">All</button>
          <button type="button" ref="To" value="to" onClick={this.propagateClick.bind(this, "to")} className="btn btn-default">To</button>
          <button type="button" ref="From" value="from" onClick={this.propagateClick.bind(this, "from")} className="btn btn-default">From</button>
        </div>;
      } else {
        buttons = <div className="btn-group">
          <button type="button" ref="All" value="all"  onClick={this.propagateClick.bind(this, "all")} className="btn btn-default">All</button>
          <button type="button" ref="To" value="to" onClick={this.propagateClick.bind(this, "to")} className="btn btn-default">To</button>
          <button type="button" ref="From" value="from" onClick={this.propagateClick.bind(this, "from")} className="btn btn-default">From</button>
          <button type="button" ref="Us" value="us" onClick={this.propagateClick.bind(this, "us")} className="btn btn-default">Us</button>
        </div>;
      }
    }

    return (
      <div className="feedHeader">
        <div>
          <div>
            <h3 className="feedTitle panel-title">Feed</h3>
              <span className="feed-info glyphicon glyphicon-info-sign" data-toggle="popover" data-placement="right" title={strings.FEED_INFO_TITLE} data-content={feedInfoContent}></span>
          </div>
          {buttons}
        </div>
      </div>
    );
  }
});

module.exports = FeedHeader;

