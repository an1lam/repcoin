'use strict';
var React = require('react');
var strings = require('../lib/strings_utils.js');

var LinkDelete = React.createClass({
  render: function() {
    return(
      <div className="linkDelete">
        <strong>{strings.DELETE_THIS_LINK}</strong>
        <form onSubmit={this.props.delete} onReset={this.props.reset}>
          <button type="submit" className="btn btn-danger">Delete</button>
          <button type="reset" className="btn btn-default">Cancel</button>
        </form>
      </div>
    );
  }
});

module.exports = LinkDelete;
