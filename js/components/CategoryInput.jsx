"use strict";

var CategorySearch = require('./CategorySearch.jsx');
var CategorySearchDisplayTable = require('./CategorySearchDisplayTable.jsx');
var React = require('react');

var CategoryInput = React.createClass({
  getInitialState: function() {
    return {
      query: '',
      filteredData: []
    }
  },

  search: function(query) {
    var url = '/api/categories/';
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
      <div className="categoryInput">
        <CategorySearch query={this.state.query} search={this.search} />
        <CategorySearchDisplayTable onReset={this.props.onReset} user={this.props.user} data={this.state.filteredData} />
      </div>
    );
  }
});

module.exports = CategoryInput;
