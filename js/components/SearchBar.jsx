/** @jsx React.DOM */
"use strict";

var React = require('react');

var SearchBar = React.createClass({
  search: function() {
    var query = this.refs.searchInput.getDOMNode().value;
    this.props.search(query);
  },

  render: function() {
    return (
      <div className="searchBar">
        <div className="input-group">
          <input type="text" ref="searchInput" value={this.props.query} onChange={this.search} className="form-control" placeholder="Search" />
          <div className="input-group-btn">
            <button type="submit" className="btn btn-default"><span className="glyphicon glyphicon-search"></span></button>  
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SearchBar;
