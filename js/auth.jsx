/** @jsx React.DOM */
"use strict";
var React = require('react');
var $ = require('jquery');

var auth = {
  logIn: function(username, password, cb) {
    $.post({
      url: '/api/login',
      data: {
        username: username,
        password: password
      },
      success: function(data) {
        return true;
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(err);
        return false;
      }.bind(this)
    });
  },

  loggedIn: function() {
    $.ajax({
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
