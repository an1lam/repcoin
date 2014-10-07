/** @jsx React.DOM */
"use strict";

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var auth = require('../auth.jsx');

var SearchBar = require('./SearchBar.jsx');
var Logout = require('./Logout.jsx');

var Toolbar = React.createClass({
  getInitialState: function() {
    return {
      loggedIn: false
    };
  },

  componentDidMount: function() {
    if (this.isMounted()) {
      auth.loggedIn(function(loggedIn) {
        this.setState({ loggedIn: loggedIn });
      }.bind(this));
    }
  },

  render: function() {
    var LogoutOrNothing = this.state.loggedIn ? <Logout /> : "";
    return (
      <div className="toolbar navbar navbar-default" role="navigation">
        <div className="navbar-header">
          <div className="toolbarHomeLink navbar-brand"><Link to="home">Reps</Link></div>
        </div>
        <SearchBar />
        <div className="navbar navbar-right"><div className="navbar-header navbar-brand">{LogoutOrNothing}</div></div>
      </div>
    );
  }
});

module.exports = Toolbar;
