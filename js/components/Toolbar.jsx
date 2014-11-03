/** @jsx React.DOM */
"use strict";

var auth = require('../auth.jsx');
var InstantBox = require('./InstantBox.jsx');
var Logout = require('./Logout.jsx');
var React = require('react');
var Router = require('react-router');

var Link = Router.Link;

var Toolbar = React.createClass({
  getInitialState: function() {
    return {
      loggedIn: false
    };
  },

  componentDidMount: function() {
    if (this.isMounted()) {
      this.setState({ loggedIn: auth.loggedIn() });
    }
  },

  render: function() {
    var LogoutOrNothing = this.state.loggedIn ? <Logout /> : "";
    return (
      <div className="toolbar navbar navbar-default" role="navigation">
        <div className="navbar-header">
          <div className="toolbarHomeLink navbar-brand"><Link to="home">Reps</Link></div>
        </div>
        <div className="col-md-3 col-md-offset-1">
          <InstantBox />
        </div>
        <div className="navbar navbar-right"><div className="navbar-header navbar-brand">{LogoutOrNothing}</div></div>
      </div>
    );
  }
});

module.exports = Toolbar;
