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
      url: '/api/users/',
      data: data,
      success: function(users) {
        $.ajax({
          url: '/api/categories/',
          data: data,
          success: function(categories) {
            var filteredData = (users.concat(categories)).sort(this.compareFunc);
            this.setState({
              query: query,
              filteredData: filteredData
            });
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(status, err.toString());
          }.bind(this)
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this) 
    });
  },

  // TODO: compare with something more meaningful than the alphabet
  compareFunc: function(a, b) {
    var aName = a.name ? a.name : a.firstname;
    var bName = b.name ? b.name : b.firstname;
    if (aName < bName) {
      return -1;
    } 
    if (bName < aName) {
      return 1;
    }
    return 0;
  },

  render: function() {
    return (
      <div className="instantBox">
        <SearchBar query={this.state.query} search={this.search} />
        <SearchDisplayTable data={this.state.filteredData} />
      </div>
    );
  }
});

module.exports = InstantBox;
