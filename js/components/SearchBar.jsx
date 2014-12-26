'use strict';

var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;

var SearchBar = React.createClass({
  mixins: [Navigation],

  search: function() {
    var query = this.refs.searchInput.getDOMNode().value;
    this.props.search(query);
  },

  handleKeyDown: function(event) {
    switch (event.keyCode) {
      case 40: // down
        event.preventDefault();
        if ($(".searchItem-0")) {
          $(".searchItem-0").focus();
        }
      break;
      case 13: // enter
        $(".searchbtn").click();
      default: return;
    }
  },

  handleClick: function(event) {
    var query = this.refs.searchInput ? this.refs.searchInput.getDOMNode().value.trim() : '';
    if (query.length > 0) {
      this.transitionTo('search', {query: query });
    }
  },


  render: function() {
    return (
      <div className="searchBar" onKeyDown={this.handleKeyDown}>
        <div className="input-group">
          <input type="text" ref="searchInput" value={this.props.query} onChange={this.search} className="searchBarInput form-control" placeholder="Search" />
          <div className="input-group-btn">
            <button onClick={this.handleClick} type="submit" className="searchbtn btn btn-default"><span className="glyphicon glyphicon-search"></span></button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SearchBar;
