/** @jsx React.DOM */
"use strict";
var React = require('react');
var auth = require('../auth.jsx');

var AuthenticatedRoute = {
  statics: {
    willTransitionTo: function(transition) {
      if (!auth.loggedIn()) {
        transition.redirect('/');
      }
    }
  }
};

module.exports = AuthenticatedRoute;
