/** @jsx React.DOM */
"use strict";
var React = require('react');
var $ = require('jquery');
var Router = require('react-router');
var Navigation = Router.Navigation;

var auth = {
  mixins: [Navigation],

  logIn: function(username, password, cb) {
    return $.ajax({
      type: 'POST',
      url: '/api/login',
      data: {
        username: username,
        password: password
      },
      success: function(user) {
        window.localStorage.setItem('currentUser', JSON.stringify(user));
        // Add token to localStorage that just stores the login response
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

  storeCurrentUser: function(user, cb) {
    window.localStorage.setItem('currentUser', JSON.stringify(user));
    cb(user);
  }, 

  getCurrentUser: function(cb) {
    function getCurrentUserLocal(cb) {
      if (typeof window.localStorage === "undefined") {
        return false;
      }
      var currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
      if (!currentUser) {
        return false;
      } else {
        cb(currentUser);
        return true;
      }
    }

    function getCurrentUserRemote(cb) {
      $.ajax({
        url:  '/api/user',
        success: function(user) {
          window.localStorage.setItem('currentUser', JSON.stringify(user));
          cb(user);
        },
        error: function(xhr, status, err) {
          console.error(this.props.userId, status, err.toString());
          cb(null);
        }
      });
    }
    if (!getCurrentUserLocal(cb)) {
      getCurrentUserRemote(cb);
    }
  },

  loggedIn: function() {
    return !!window.localStorage.getItem('currentUser'); 
  },

  logOut: function() {
    return $.ajax({
      url: 'api/logout',
      type: 'POST',
      error: function(xhr, status, err) {
        console.log(err);
        return false;
      }.bind(this),
      success: function(user) {
        window.localStorage.removeItem('currentUser', JSON.stringify(user));
        return true;
      }.bind(this),
    });
  }
};

module.exports = auth;
