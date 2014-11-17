"use strict";
var auth = require('../auth.jsx');
var React = require('react');
var Router = require('react-router');

var LoggedInRoute = {
  statics: {
    willTransitionTo: function (transition) {
      if (auth.loggedIn()) {
        transition.redirect('/home');
      }
    }
  }
};

module.exports = LoggedInRoute;
