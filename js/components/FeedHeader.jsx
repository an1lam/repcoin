/** @jsx React.DOM */
"use strict";

var React = require('react');
var Feed = require('./Feed.jsx');

var FeedHeader = React.createClass({
  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
    this.setState({ filter: "all" });
  },

  propogateClick: function(newFilter) {
    this.setState({ filter: newFilter });
    this.props.onClick(newFilter);
  },

  render: function() {
    return (
      <div className="feedHeader btn-group">
        <button type="button" ref="All" value="all"  onClick={this.propogateClick.bind(this, "all")} className="btn btn-default">All</button>
        <button type="button" ref="To" value="to" onClick={this.propogateClick.bind(this, "to")} className="btn btn-default">To</button>
        <button type="button" ref="From" value="from" onClick={this.propogateClick.bind(this, "from")} className="btn btn-default">From</button>
        <button type="button" ref="Us" value="us" onClick={this.propogateClick.bind(this, "us")} className="btn btn-default">Us</button>
      </div>
    );
  }
});

module.exports = FeedHeader;

