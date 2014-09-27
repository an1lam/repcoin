/** @jsx React.DOM */
"use strict";

var React = require('react');

var SearchBar = React.createClass({
  render: function() {
    return (
      <div className="searchBar">
        <form className="navbar-form navbar-left" role="search">
          <div className="form-group">
            <input type="text" className="form-control" placeholder="Search" />
            <button type="submit" className="btn btn-default">
              <span className="glyphicon glyphicon-search"></span>
            </button>
          </div>
         </form>
      </div>
    );
  }
});

module.exports = SearchBar;
          
