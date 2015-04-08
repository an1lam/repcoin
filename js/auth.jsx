'use strict';
var $ = require('jquery');

var auth = {
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
};

module.exports = auth;
