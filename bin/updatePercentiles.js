#!/usr/bin/env node

var mongoose = require('mongoose');
var utils = require('./utils.js');
var winston = require('winston');

// Set up the database url
var db = require('../config/db');
if (process.env.NODE_ENV === 'production') {
  winston.log('info', 'Starting updatePercentiles in production environment');
  var mongoURL = db.production_url;
} else {
  winston.log('info', 'Starting updatePercentiles in development environment');
  var mongoURL = db.development_url;
}
mongoose.connect(mongoURL);
mongoose.connection.on('connected', function() {
  utils.setPreviousPercentileToCurrent(function() {
    if (errs) {
      winston.log('info', 'Update percentiles finished with errors.');
    }
    mongoose.connection.close();
    process.exit();
  });
});
