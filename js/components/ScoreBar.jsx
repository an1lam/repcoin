/** @jsx React.DOM */
"use strict";

var React = require('react');
var $ = require('jquery');

var ScoreBar = React.createClass({
  getIntitialState: function() {
    return {};
  },

  componentDidMount: function() {
    var w = this.props.directRep + "%";
    $(".score").width(w);
    
    var change = this.props.directRep - this.props.prevDirectRep;
    var color = change < 0 ? "#BD362F" : "#51A351";
    $(".score").css("background-color", color);
  },

  render: function() {
    return (
      <div className="scoreBar">
        <div className="score"></div>
        <div className="number">{this.props.directRep}</div>
      </div>
    );
  }
});

module.exports = ScoreBar;
