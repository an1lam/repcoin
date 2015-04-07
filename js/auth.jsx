'use strict';
var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;

var auth = {
  mixins: [Navigation],

  getCurrentUser: function(cb) {
    $.ajax({
      url:  '/api/user',
      success: function(user) {
        if (user) {
          cb(user);
        } else {
          cb(null);
        }
      },
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
        cb(null);
      }
    });
  },

  loggedIn: function(cb) {
    $.ajax({
      url:  '/api/loggedin',
      success: function(loggedIn) {
        cb(loggedIn);
      },
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
        cb(null);
      }
    });
  },

  loggedInWithPromise: function(cb) {
    return $.ajax({
      url:  '/api/loggedin',
    });
  },
};

module.exports = auth;
