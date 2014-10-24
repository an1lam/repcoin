/** @jsx React.DOM */
"use strict";

var React = require('react');
var Toolbar = require('./Toolbar.jsx');
var Footer = require('./Footer.jsx');
var Feed = require('./Feed.jsx');
var CategoriesTable = require('./CategoriesTable.jsx');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');

var HomePage = React.createClass({
  mixins: [AuthenticatedRoute],
  render: function() {
    return (
      <div className="homePage">
        <Toolbar />
        <div className="col-md-8 col-md-offset-2"><Feed parent="HomePage" /></div>
        <Footer />
      </div>
    );
  }
});

module.exports = HomePage;
