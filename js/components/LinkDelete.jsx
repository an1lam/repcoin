'use strict';
var React = require('react');

var LinkDelete = React.createClass({

  render: function() {
    return(
      <div className="linkDelete">
        <strong>Delete this link?</strong>
        <form onSubmit={this.props.delete} onReset={this.props.reset}>
          <button type="submit" className="btn btn-danger">Delete</button>
          <button type="reset" className="btn btn-default">Cancel</button>
        </form>
      </div>
    );
  }
});

module.exports = LinkDelete;
