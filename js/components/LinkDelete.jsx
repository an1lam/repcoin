/** @jsx React.DOM */
"use strict"; 

var React = require('react');
var $ = require('jquery');

var LinkDelete = React.createClass({
  getInitialState: function() {
    return {};
  },

  propogateDelete: function(event) {
    event.preventDefault();
    this.props.onDelete();
  },

  propogateReset: function() {
    this.props.onReset();
  },

  render: function() {
    return(
      <div className="linkDelete">
        <strong>Delete this link?</strong>
        <form onSubmit={this.propogateDelete} onReset={this.propogateReset}>
          <button type="submit" className="btn btn-danger">Delete</button> 
          <button type="reset" className="btn btn-default">Cancel</button> 
        </form>
      </div>
    );
  }
});

module.exports = LinkDelete;
