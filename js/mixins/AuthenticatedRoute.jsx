'use strict';
var auth = require('../auth.jsx');
var React = require('react');
var Router = require('react-router');

var AuthenticatedRoute = {
  statics: {
    willTransitionTo: function (transition) {
      auth.loggedIn(function(loggedIn) {
        if (!loggedIn) {
          transition.redirect('/login');
        }
      });
    }
  }
};

module.exports = AuthenticatedRoute;
