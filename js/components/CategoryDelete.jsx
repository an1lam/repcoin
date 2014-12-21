'use strict';
var React = require('react');

var CategoryDelete = React.createClass({

  render: function() {
    var msg = this.props.investor ?
      'Are you sure you want to delete the category \'' + this.props.name
      + '\' ? Your experts will retain the investments you have made, and you will '
      + 'lose your investor status for this category as well as all of the reps you have earned.' :

      'Are you sure you want to delete the category \'' + this.props.name
      + '\' ? This action cannot be undone. Your investors will all receive the current value of '
      + 'your investments, and you will lose the reps you have in this category.';

    return(
      <div className="expert-category-delete">
        <strong>{msg}</strong>
        <form onSubmit={this.props.onDelete} onReset={this.props.onReset}>
          <button type="submit" className="btn btn-danger">Go ahead and delete it!</button>
          <button type="reset" className="btn btn-default">Cancel</button>
        </form>
      </div>
    );
  }
});

module.exports = CategoryDelete;
