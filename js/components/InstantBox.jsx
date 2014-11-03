"use strict";

var $ = require('jquery');
var SearchDisplayTable = require('./SearchDisplayTable.jsx');
var React = require('react');
var SearchBar = require('./SearchBar.jsx');

var InstantBox = React.createClass({
  getInitialState: function() {
    return {
      query: '',
      filteredData: []
    }
  },

  search: function(query) {
    var url = '/api/users/';
    var data = { searchTerm: query };
    if (query.length === 0) {
      this.setState({
        query: query,
        filteredData: []
      });
      return;
    }

    $.ajax({
      url: url,
      data: data,
      success: function(results) {
        this.setState({
          query: query,
          filteredData: results
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this) 
    });
  },

  render: function() {
    return (
      <div className="instantBox">
        <SearchBar query={this.state.query} search={this.search} />
        <div>
          <SearchDisplayTable data={this.state.filteredData} />
        </div>
      </div>
    );
  }
});

module.exports = InstantBox;
