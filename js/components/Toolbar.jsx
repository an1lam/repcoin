/** @jsx React.DOM */
"use strict";

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var SearchBar = require('./SearchBar.jsx');
var Toolbar = React.createClass({
  render: function() {
    return (
      <div className="toolbar navbar navbar-default" role="navigation">
        <div className="navbar-header">
          <div className="toolbarHomeLink navbar-brand"><Link to="home">Reps</Link></div>
        </div>
        <SearchBar />
      </div>
    );
  }
});

module.exports = Toolbar;
