/** @jsx React.DOM */
"use strict";

var React = require('react');

var LinkItem = React.createClass({
  render: function() {
    return(
      <div className="linkItem">
        <strong>{this.props.link.title}</strong>: <a href={this.props.link.url}>{this.props.link.url}</a>
      </div> 
    );
  }
});

module.exports = LinkItem;
