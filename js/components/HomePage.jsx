/** @jsx React.DOM */
"use strict";

var React = require('react');
var Toolbar = require('./Toolbar.jsx');
var Footer = require('./Footer.jsx');
var Feed = require('./Feed.jsx');
var CategoriesTable = require('./CategoriesTable.jsx');

var HomePage = React.createClass({
  render: function() {
    return (
      <div className="homePage">
        <Toolbar />
        <Feed />
        <CategoriesTable />
        <Footer />
      </div>
    );
  }
});

module.exports = HomePage;
