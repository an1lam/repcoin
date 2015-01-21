'use strict';

var React = require('react');
var strings = require('../lib/strings_utils.js');

var CategoriesHeader = React.createClass({
  render: function() {
    return (
      <div className="categoriesHeader">
        <strong>{strings.EXPERT_CATEGORIES(this.props.user.username)}</strong>
      </div>
    );
  }
});

module.exports = CategoriesHeader;
