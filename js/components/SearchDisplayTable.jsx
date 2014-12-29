"use strict";

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
      maxIndex: newProps.data.length - 1
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

  render: function() {
    var i = 0;
    return (
      <div className="searchDisplayTable">
        <ul className="list-group">
          {this.props.data.map(function(datum) {
            var name = "searchItem-" + i;
            i += 1;
            if (datum.name) {
              return <li key={datum._id} className="list-group-item">
                <Link onKeyDown={this.handleKeyDown} className={name} to="category" params={{category: datum.name}}><SearchItem name={datum.name} index={i-1}/></Link>
              </li>;
            } else {
              return <li key={datum._id} className="list-group-item">
                <Link onKeyDown={this.handleKeyDown} className={name} to="profile" params={{userId: datum._id}}><SearchItem name={datum.username} index={i-1}/></Link>
              </li>;
            }
          }.bind(this))}
        </ul>
      </div>
    );
  }
});

module.exports = SearchDisplayTable;
