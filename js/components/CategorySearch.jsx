'use strict';

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
        var baseSearchItem = "." + this.props.type + "searchItem-0";
        if ($(baseSearchItem)) {
          $(baseSearchItem).focus();
        }
        break;

      case 13: // return
        var submitBtn = "." + this.props.type + "submit";
        event.preventDefault();
        $(submitBtn).click();
        break;

      default: return;
    }
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var categoryName = this.props.query;
    if (this.props.type === 'expert') {
      var cb = this.props.setExpertCategory;
    } else {
      var cb = this.props.setInvestorCategory;
    }
    this.props.getCategory(categoryName, cb);
  },

  render: function() {
    var submitClasses = this.props.type + 'submit btn btn-primary';
    var searchBarInput = this.props.type + 'search form-control';
    return (
      <div className="searchBar" onKeyDown={this.handleKeyDown}>
        <div className="input-group">
          <input type="text" ref="searchInput" value={this.props.query} onChange={this.search} className={searchBarInput} placeholder="Search" />
          <div className="input-group-btn">
            <button type="submit" onClick={this.handleSubmit} className={submitClasses}><span className="glyphicon glyphicon-ok"></span></button>
          </div>
          <div className="input-group-btn">
            <button type="reset" onClick={this.props.onReset} className="btn btn-default"><span className="glyphicon glyphicon-remove"></span></button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = CategorySearch;
