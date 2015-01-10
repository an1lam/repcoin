'use strict';

var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var SearchItem = require('./SearchItem.jsx');

var Link = Router.Link;

var CategorySearchDisplayTable = React.createClass({
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
      maxIndex: newProps.data.length - 1
    });
  },

  handleKeyDown: function(event) {
    switch (event.keyCode) {

      case 38: // up
        if (this.state.index === 0) {
          var searchBarInput = '.' + this.props.type + 'search';
          $(searchBarInput).focus();
        }

        else if (this.state.index > 0) {
          var searchBarItem = '.' + this.props.type + 'searchItem-';
          var i = this.state.index-1;
          this.setState({ index: i });
          $(searchBarItem + i).focus();
        }
      break;

      case 40: // down
        if (this.state.index < this.state.maxIndex) {
          var searchBarItem = '.' + this.props.type + 'searchItem-';
          var i = this.state.index+1;
          this.setState({ index: i });
          $(searchBarItem + i).focus();
        }
      break;

      default: return;
    }
    event.preventDefault();
  },

  render: function() {
    var i = 0;
    var searchBarItem = this.props.type + 'searchItem-';
    var clazz = this.props.type + 'SearchTable searchDisplayTable'
    return (
      <div className={clazz}>
        <ul className="list-group">
          {this.props.data.map(function(datum) {
            var name = searchBarItem + i;
            i += 1;
            return <li key={datum._id} className="list-group-item">
              <a href={datum.name} onClick={this.props.handleClick} onKeyDown={this.handleKeyDown} className={name}>
                <SearchItem name={datum.name} index={i-1}/>
              </a>
              </li>;
          }.bind(this))}
        </ul>
      </div>
    );
  }
});

module.exports = CategorySearchDisplayTable;
