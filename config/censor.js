'use strict';

var naughtylist = require('./naughtylist.js');
var length = naughtylist.length;
var util = require('util');

// Express middleware to check for words that should not be allowed
var censor = {
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
      }
    }

    // Examine req.query
    for (var key in req.query) {
      if (req.query.hasOwnProperty(key)) {
        if (isNaughtyWord(req.query[key].toString().toLowerCase())) {
          return res.status(422).send('Inappropriate content detected.');
        }
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
      }
    }

    next();
  },
};

module.exports = censor;
