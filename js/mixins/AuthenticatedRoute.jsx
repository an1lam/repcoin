/** @jsx React.DOM */
"use strict";
var React = require('react');
var auth = require('../auth.jsx');
var Router = require('react-router');

var AuthenticatedRoute = {
  statics: {
    willTransitionTo: function(transition) {
      auth.loggedIn(function(loggedIn) {
        if (!loggedIn) {
          //TODO: figure out why transition.redirect didn't work
          Router.replaceWith('/login');
        }
      }.bind(this));
    }
  }
};

module.exports = AuthenticatedRoute;
