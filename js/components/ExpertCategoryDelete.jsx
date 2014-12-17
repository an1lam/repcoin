'use strict';
var React = require('react');

var ExpertCategoryDelete = React.createClass({

  render: function() {
    return(
      <div className="expert-category-delete">
        <strong>Are you sure you want to delete the category '{this.props.name}'? This action cannot be undone. Your investors will all receive the current value of your investments, and you will lose the reps you have in this category.</strong>
        <form onSubmit={this.props.onDelete} onReset={this.props.onReset}>
          <button type="submit" className="btn btn-danger">Go ahead and delete it!</button> 
          <button type="reset" className="btn btn-default">Cancel</button> 
        </form>
      </div>
    );
  }
});

module.exports = ExpertCategoryDelete;
