'use strict';

var React = require('react');
var Link = require('react-router').Link;

var Category = React.createClass({

  formatQuotes: function() {
    var formattedQuotes = this.props.quotes.map(function(quote) {
      return <p>"{quote}"</p>;
    });
    return formattedQuotes;
  },

  render: function() {
    return (
      <div className="col-md-4 category-item">
        <div>
          <h3><Link to="category" params={{category: this.props.category.name}}>{this.props.category.name}</Link></h3>
        </div>
        <div>
          <h5>{this.props.category.experts} Experts</h5>
          <h5>{this.props.category.investors} Investors</h5>
          <h5>Market Size: {this.props.category.reps}</h5>
        </div>
      </div>
    );
  }
});

module.exports = Category;
