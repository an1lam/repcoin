'use strict';
var React = require('react');
var strings = require('../lib/strings_utils.js');

var CategoryDelete = React.createClass({

  render: function() {
    var msg;
    if (this.props.investor) {
      msg = strings.ARE_YOU_SURE_DELETE_INVESTOR_CATEGORY(this.props.name);
    } else {
      msg = strings.ARE_YOU_SURE_DELETE_EXPERT_CATEGORY(this.props.name);
    }

    return(
      <div className="category-delete">
        <strong>{msg}</strong>
        <form onSubmit={this.props.onDelete} onReset={this.props.onReset}>
          <button type="submit" className="btn btn-danger">{strings.DELETE_CATEGORY}</button>
          <button type="reset" className="btn btn-default">{strings.CANCEL_DELETE_CATEGORY}</button>
        </form>
      </div>
    );
  }
});

module.exports = CategoryDelete;
