/** @jsx React.DOM */
"use strict";

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Footer = React.createClass({
  render: function() {
    return (
      <div id="footer">
        <p>Footer</p>
      </div>
    );
  }
});

module.exports = Footer;
