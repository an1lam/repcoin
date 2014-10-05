/** @jsx React.DOM */
"use strict";
var React = require('react');
var request = require('superagent-browserify');

var auth = {
  logIn: function(username, password, storage, cb) {
    if (storage.token) {
      return cb(true);
    }
    request
     .post('/api/login')
     .send({ username: username, password: password })
     .end(function(err, res) {
     if (err) {
       console.log(err);
       return;
     }
     storage.token = res.token;
     });

    return ;
  },
  loggedIn: function(storage) {
    return !!storage.token;
  }
};

module.exports = auth;
