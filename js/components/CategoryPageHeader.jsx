"use strict";

var React = require('react');

var CategoryPageHeader = React.createClass({
  render: function() {
    var total = this.props.category.repsInvested + this.props.category.repsLiquid;
    return (
      <div className="categoryPageHeader">
        <h1 className="text-center">{this.props.category.name}</h1>
        <div>
          {this.props.category.quotes.map(function(quote) {
            return <h3 className="text-center" key={quote.text}>"{quote.text}"</h3>
          })}
        </div>
        <h4 className="text-center">Total reps in {this.props.category.name}: {total}</h4>
      </div>
    );
  }
});

module.exports = CategoryPageHeader;
