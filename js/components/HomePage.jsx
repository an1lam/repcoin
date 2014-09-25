/** @jsx React.DOM */
"use strict";

var React = require('react');
var Toolbar = require('./Toolbar.jsx');
var Feed = require('./Feed.jsx');

var HomePage = React.createClass({
  render: function() {
    return (
      <div className="homePage">
        <Toolbar />
        <Feed />
      </div>
    );
  }
});

module.exports = HomePage;
