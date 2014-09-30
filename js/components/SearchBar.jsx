/** @jsx React.DOM */
"use strict";

var React = require('react');

var SearchBar = React.createClass({
  render: function() {
    return (
      <div className="searchBar">
        <form className="navbar-form navbar-left" role="search">
          <div className="input-group">
            <input type="text" className="form-control" placeholder="Search" />
            <div className="input-group-btn">
              <button type="submit" className="btn btn-default"><span className="glyphicon glyphicon-search"></span></button>  
            </div>
          </div>
        </form>
      </div>
    );
  }
});

module.exports = SearchBar;
