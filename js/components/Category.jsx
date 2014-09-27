/** @jsx React.DOM */
"use strict";

var React = require('react');
var Link = require('react-router').Link;

var Category = React.createClass({
  render: function() {
    return (
<div><h3><Link to="category" params={{category: this.props.category}}>{this.props.category}</Link></h3>
      {this.formatQuotes()}</div>
    );
  },

  formatQuotes: function() {
    var formattedQuotes = this.props.quotes.map(function(quote) {
      return <p>{quote}</p>;
    });
    return formattedQuotes;
  }
});

module.exports = Category;
