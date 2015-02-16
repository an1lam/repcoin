'use strict';

var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var SearchItem = require('./SearchItem.jsx');

var Link = Router.Link;

var SearchDisplayTable = React.createClass({
  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
    this.setState({
      index: 0,
      maxindex: this.props.data.length - 1
    });
  },

  componentWillReceiveProps: function(newProps) {
    this.setState({
      index: 0,
      maxIndex: 8,
    });
  },

  handleKeyDown: function(event) {
    switch (event.keyCode) {
      case 38: // up
        if (this.state.index === 0) {
          $(".searchBarInput").focus();
        }

        else if (this.state.index > 0) {
          var i = this.state.index-1;
          this.setState({ index: i });
          $(".searchItem-" + i).focus();
        }
      break;

      case 40: // down
        if (this.state.index < this.state.maxIndex) {
          var i = this.state.index+1;
          this.setState({ index: i });
          $(".searchItem-" + i).focus();
        }
      break;

      default: return;
    }
    event.preventDefault();
  },

  getSearchResults: function(data) {
    var datum, name;
    var results = [];
    var i = 0;
    while (i < 8 && i < data.length) {
      name = 'searchItem-' + i;
      datum = data[i];
      if (datum.name) {
        results.push(
          <li key={datum._id} className="list-group-item">
            <Link onKeyDown={this.handleKeyDown} className={name} to="category" params={{category: datum.name}}><SearchItem type='category' data={datum} index={i-1}/></Link>
          </li>
        );
      } else {
        results.push(
          <li key={datum._id} className="list-group-item">
            <Link onKeyDown={this.handleKeyDown} className={name} to="profile" params={{userId: datum._id}}><SearchItem data={datum} index={i-1}/></Link>
          </li>
        );
      }
      i++;
    }
    if (data.length > i) {
      name = 'searchItem-' + i;
      results.push(
        <li key={data[i]._id} className="list-group-item">
          <Link onKeyDown={this.handleKeyDown} className={name} to="search" params={{query: this.props.query}}>See all results for '{this.props.query}'</Link>
        </li>
      );
    }
    return results;
  },

  render: function() {
    var i = 0;
    return (
      <div className="searchDisplayTable mainSearchTable">
        <ul className="list-group">
          {this.getSearchResults(this.props.data)}
        </ul>
      </div>
    );
  }
});

module.exports = SearchDisplayTable;
