'use strict';

var $ = require('jquery');
var React = require('react');

var ScoreBar = React.createClass({
  componentDidMount: function() {
    this.updateDOM(this.props);
  },

  componentWillReceiveProps: function(newProps) {
    this.updateDOM(newProps);
  },

  updateDOM: function(props) {
    var change = props.rank - props.previousRank;
    var color = change < 0 ? '#BD362F' : '#51A351';

    // Calculate the percentage of the column to fill
    var totalW = $('.rank-col').width();
    var maxPercent = (totalW - $('.number').outerWidth(true))/totalW;
    var w = maxPercent * props.rank * 100 + '%';

    var id = props.category.split(' ').join('_');

    $('.' + id).width(w);
    $('.' + id).css('background-color', color);
  },

  render: function() {
    var classes = "score " + this.props.category.split(' ').join('_');
    return (
      <div className="scoreBar">
        <div className={classes}></div>
        <div className="number">{this.props.rank}</div>
      </div>
    );
  }
});

module.exports = ScoreBar;
