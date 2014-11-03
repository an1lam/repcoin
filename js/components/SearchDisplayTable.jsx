"use strict";

var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var SearchItem = require('./SearchItem.jsx');

var Link = Router.Link;

var SearchDisplayTable = React.createClass({
  render: function() {
    return (
      <div className="searchDisplayTable">
        <ul className="list-group">
          {this.props.data.map(function(datum) {
            return <li key={datum._id} className="list-group-item">
              <Link to="profile" params={{userId: datum._id}}><SearchItem datum={datum} /></Link>
            </li>
          })}
        </ul> 
      </div>
    );
  } 
});

module.exports = SearchDisplayTable;
