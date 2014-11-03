"use strict";

var $ = require('jquery');
var SearchDisplayTable = require('./SearchDisplayTable.jsx');
var React = require('react');
var SearchBar = require('./SearchBar.jsx');
var Select = require('react-select');

var InstantBox = React.createClass({
  getInitialState: function() {
    return {
      query: '',
      filteredData: []
    }
  },

  getOptions: function(input, callback) {
    var url = '/api/users/';
    var data = { searchTerm: input };
    if (input.length === 0) {
      callback(null, { 
        options: [],
        complete: true
      });
    }

    $.ajax({
      url: url,
      data: data,
      success: function(results) {
        var options = [];
        for (var i = 0; i < results.length; i++) {
          var option = { value: results[i]._id,
                         label: results[i].username };
          options.push(option);
        }
        callback(null, {
          options: options,
          complete: true 
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
        <Select className="searchDisplayTable" name="searchbox" value="Search" asyncOptions={this.getOptions} />
      </div>
    );
  }
});

module.exports = InstantBox;
