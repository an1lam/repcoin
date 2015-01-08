'use strict';
var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;

var auth = {
  mixins: [Navigation],

  logIn: function(email, password, cb) {
    return $.ajax({
      type: 'POST',
      url: '/api/login',
      data: {
        email: email,
        password: password
      },
      success: function(user) {
        cb(true);
        return true;
      },
      error: function(xhr, status, err) {
        console.log(err);
        cb(false);
        return false;
      }
    });
  },

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

  logOut: function(cb) {
    return $.ajax({
      url: 'api/logout',
      type: 'POST',
      success: function(user) {
        if (cb) {
          cb(false);
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(xhr.responseText, err);
        if (cb) {
          cb(true);
        }
      }.bind(this),
    });
  }
};

module.exports = auth;
