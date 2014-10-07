/** @jsx React.DOM */
"use strict";
var React = require('react');
var $ = require('jquery');

var auth = {
  logIn: function(username, password, cb) {
    return $.ajax({
      type: 'POST',
      url: '/api/login',
      data: {
        username: username,
        password: password
      },
      success: function(data) {
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

  loggedIn: function() {
    return $.ajax({
      url: 'api/loggedIn',
      type: 'GET',
      error: function(xhr, status, err) {
        console.log(err);
        return false;
      }.bind(this),
      success: function(data) {
        return true;
      }.bind(this),
    });
  },
};

module.exports = auth;
