"use strict";

var React = require('react');

var CategorySearch = React.createClass({
  search: function() {
    var query = this.refs.searchInput.getDOMNode().value;
    this.props.search(query);
  },

  handleKeyDown: function(event) {
    switch (event.keyCode) {
      case 40: // down
        event.preventDefault();
        if ($(".categorySearchItem-0")) {
          $(".categorySearchItem-0").focus();
        }
      break;

      default: return;
    }
  },

  render: function() {
    return (
      <div className="searchBar" onKeyDown={this.handleKeyDown}>
        <div className="input-group">
          <input type="text" ref="searchInput" value={this.props.query} onChange={this.search} className="categorySearchBarInput form-control" placeholder="Search" />
          <div className="input-group-btn">
            <button type="submit" className="btn btn-primary"><span className="glyphicon glyphicon-ok"></span></button>  
          </div>
          <div className="input-group-btn">
            <button type="reset" className="btn btn-default"><span className="glyphicon glyphicon-remove"></span></button>  
          </div>
        </div>
      </div>
    );
  }
});

module.exports = CategorySearch;
