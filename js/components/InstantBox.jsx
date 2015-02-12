"use strict";

var $ = require('jquery');
var SearchDisplayTable = require('./SearchDisplayTable.jsx');
var React = require('react');
var SearchBar = require('./SearchBar.jsx');

var InstantBox = React.createClass({
  getInitialState: function() {
    return {
      query: '',
      filteredData: [],
      totalData: []
    }
  },

  componentDidMount: function() {
    $.ajax({
      url: '/api/users/',
      success: function(users) {
        $.ajax({
          url: '/api/categories/',
          success: function(categories) {
            var totalData = (users.concat(categories)).sort(this.compareFunc);
            this.setState({ totalData: totalData });
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

  search: function(query) {
    this.setState({ query: query });
    if (query.trim().length === 0) {
      this.setState({ filteredData: [] });
      return;
    }

    this.getFilteredData(query);
  },

  getFilteredData: function(query) {
    var totalData = this.state.totalData;
    var length = totalData.length;
    var filteredData = [];
    for (var i = 0; i < length; i++) {
      var regexp = new RegExp('\\b' + query, 'i');
      var name = totalData[i].username ? totalData[i].username : totalData[i].name;
      if (regexp.test(name)) {
        filteredData.push(totalData[i]);
      }
    }
    this.setState({ filteredData: filteredData });
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
        <SearchDisplayTable data={this.state.filteredData} query={this.state.query} />
      </div>
    );
  }
});

module.exports = InstantBox;
