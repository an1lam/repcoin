'use strict';

var naughtylist = require('./naughtylist.js');
var spamEmailList = require('./spamEmailList.js');
var length = naughtylist.length;
var util = require('util');

// Express middleware to check for words that should not be allowed
var censor = {
  hasSpamEmail: function(req, res, next) {
    if (req.body.email) {
      var len = spamEmailList.length;
      for (var i = 0; i < len; i++) {
        if (req.body.email.indexOf(spamEmailList[i]) > -1) {
          return res.status(422).send('Spam email domain detected');
        }
      }
    }
    next();
  },

  // Checks if a word is naughty and disables script tags
  isNaughty: function(req, res, next) {
    // Check if a word is in the naughty list
    var isNaughtyWord = function(word) {
      for (var i = 0; i < length; i++) {
        if (word === naughtylist[i]) {
          return true;
        }
      }
      return false;
    };

    // Examine req.params
    for (var key in req.params) {
      if (req.params.hasOwnProperty(key)) {
        if (isNaughtyWord(req.params[key].toString().toLowerCase())) {
          return res.status(422).send('Inappropriate content detected.');
        }
        req.params[key] = req.params[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
    }

    // Examine req.query
    for (var key in req.query) {
      if (req.query.hasOwnProperty(key)) {
        if (isNaughtyWord(req.query[key].toString().toLowerCase())) {
          return res.status(422).send('Inappropriate content detected.');
        }
        req.query[key] = req.query[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
    }

    // Examine req.body
    for (var key in req.body) {
      // Passwords are allowed to be in the naughty list
      if (key === 'password') {
        continue;
      }
      if (req.body.hasOwnProperty(key)) {
        if (isNaughtyWord(req.body[key].toString().toLowerCase())) {
          return res.status(422).send('Inappropriate content detected.');
        }
        req.body[key] = req.body[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
    }

    next();
  },
};

module.exports = censor;
