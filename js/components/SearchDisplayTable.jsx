"use strict";

var $ = require('jquery');
var React = require('react');

var SearchDisplayTable = React.createClass({
  render: function() {
    return (
      <div className="searchDisplayTable">
        <ul className="list-group">
          {this.props.data.map(function(datum) {
            return <li key={datum._id} className="list-group-item">{datum.username}</li>
          })}
        </ul> 
      </div>
    );
  } 
});

module.exports = SearchDisplayTable;
