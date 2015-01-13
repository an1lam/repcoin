#!/usr/bin/env node

var mongoose = require('mongoose');
var utils = require('./utils.js');
var winston = require('winston');

// Set up the database url
var db = require('../config/db');
if (process.env.NODE_ENV === 'production') {
  winston.log('info', 'Starting to migrate dividends and percentages in production environment');
  var mongoURL = db.production_url;
} else {
  winston.log('info', 'Starting to migrate dividends and percentages in development environment');
  var mongoURL = db.development_url;
}
mongoose.connect(mongoURL);
mongoose.connection.on('connected', function() {
  winston.log('info', 'Conected to database');
  utils.migratePercentagesAndDividends(function(errs) {
    if (errs) {
      winston.log('info', 'Migrate percentages and dividends finished with errors.');
    }
    mongoose.connection.close();
    process.exit();
  });
});
