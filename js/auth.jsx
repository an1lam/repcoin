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
    // Attempt to get the current user locally and check the server if that fails
    var currentUser = getCurrentUserLocal();
    if (!currentUser) {
      return getCurrentUserRemote(cb);
    } else {
      cb(currentUser);
    }

    function getCurrentUserLocal() {
      if (typeof window.localStorage === 'undefined') {
        return null;
      }
      return JSON.parse(window.localStorage.getItem('currentUser'));
    }

    function getCurrentUserRemote(cb) {
      $.ajax({
        url:  '/api/user',
        success: function(user) {
          if (user) {
            window.localStorage.setItem('currentUser', JSON.stringify(user));
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
    }
  },

  loggedIn: function() {
    return !!window.localStorage.getItem('currentUser');
  },

  logOut: function(cb) {
    return $.ajax({
      url: 'api/logout',
      type: 'POST',
      success: function(user) {
        window.localStorage.removeItem('currentUser', JSON.stringify(user));
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
