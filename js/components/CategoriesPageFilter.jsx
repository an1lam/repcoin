'use strict';
var React = require('react');
var strings = require('../lib/strings_utils.js');

var CategoriesActionCreator = require('../actions/CategoriesActionCreator.js');

var CategoriesPageFilter = React.createClass({
  render: function() {
    return (
      <div className="categoriesPageFilter">Sort by:
        <select onChange={this.props.onFilter}>
          <option>{strings.ALPHABETICAL}</option>
          <option>{strings.MARKET_SIZE_HIGH_TO_LOW}</option>
          <option>{strings.MARKET_SIZE_LOW_TO_HIGH}</option>
          <option>{strings.EXPERTS_HIGH_TO_LOW}</option>
          <option>{strings.INVESTORS_HIGH_TO_LOW}</option>
        </select>
      </div>
    );
  },

});

module.exports = CategoriesPageFilter;
