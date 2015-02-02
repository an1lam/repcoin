'use strict';

var naughtylist = require('./naughtylist.js');
var length = naughtylist.length;
var util = require('util');

// Express middleware to check for words that should not be allowed
var censor = {
  isNaughty: function(req, res, next) {
    var reqString = util.inspect(req).toLowerCase();
    for (var i = 0; i < length; i++) {
      if (reqString.indexOf(naughtylist[i]) > -1) {
        return res.status(422).send('Inappropriate content detected.');
      }
    }
    next();
  },
};

module.exports = censor;
