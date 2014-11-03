"use strict";

var React = require('react');

var CategoryPageHeader = React.createClass({
  render: function() {
    return (
      <div className="categoryPageHeader">
        <h1 className="text-center">{this.props.category.name}</h1>
        <div>
          {this.props.category.quotes.map(function(quote) {
            return <h3 className="text-center" key={quote.text}>"{quote.text}"</h3>
          })}
        </div>
      </div>
    );
  }
});

module.exports = CategoryPageHeader;
