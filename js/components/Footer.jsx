/** @jsx React.DOM */
"use strict";

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Footer = React.createClass({
  render: function() {
    return (
      <div className="footerbar">
        <Link to="home">Home</Link>
      </div>
    );
  }
});

module.exports = Footer;
