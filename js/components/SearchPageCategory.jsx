"use strict";

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var SearchPageCategory = React.createClass({
  render: function() {
    return (
      <div className="searchPageItem searchPageCategory">
        <Link to="category" params={{category: this.props.category.name}}>
          <h2>{this.props.category.name}</h2>
        </Link>
        <div>
          <h3>Experts:  {this.props.category.experts}</h3>
          <h3>Investors:  {this.props.category.investors}</h3>
          <h3>Reps: {this.props.category.repsLiquid + this.props.category.repsInvested}</h3>
        </div>
      </div>
    );
  }
});

module.exports = SearchPageCategory;
