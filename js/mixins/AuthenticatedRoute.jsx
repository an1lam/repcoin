/** @jsx React.DOM */
"use strict";
var React = require('react');
var auth = require('../auth.jsx');
var Router = require('react-router');

var AuthenticatedRoute = {
  statics: {
    willTransitionTo: function (transition) {
      if (!auth.loggedIn()) {
        transition.redirect('/login');
      }
    }
  }
};

module.exports = AuthenticatedRoute;
