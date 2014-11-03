"use strict";

var $ = require('jquery');
var React = require('react');
var SearchItem = require('./SearchItem.jsx');

var SearchDisplayTable = React.createClass({
  render: function() {
    return (
      <div className="searchDisplayTable">
        <ul className="list-group">
          {this.props.data.map(function(datum) {
            return <li key={datum._id} className="list-group-item"><SearchItem datum={datum} /></li>
          })}
        </ul> 
      </div>
    );
  } 
});

module.exports = SearchDisplayTable;
