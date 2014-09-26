/** @jsx React.DOM */
"use strict";

var React = require('react');
var Toolbar = require('./Toolbar.jsx');
var Feed = require('./Feed.jsx');
var CategoriesTable = require('./CategoriesTable.jsx');

var HomePage = React.createClass({
  render: function() {
    return (
      <div className="homePage">
        <Toolbar />
        <Feed />
        <CategoriesTable />
      </div>
    );
  }
});

module.exports = HomePage;
