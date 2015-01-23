#!/usr/bin/env node

var mongoose = require('mongoose');
var utils = require('./utils.js');
var winston = require('winston');

// Set up the database url
var db = require('../config/db');
if (process.env.NODE_ENV === 'production') {
  winston.log('info', 'Starting migrate category reps in production environment');
  var mongoURL = db.production_url;
} else {
  winston.log('info', 'Starting migrate category reps in development environment');
  var mongoURL = db.development_url;
}

mongoose.connect(mongoURL);
mongoose.connection.on('connected', function() {
  utils.migrateCategoryReps(function(errs) {
    if (errs) {
      winston.log('error', 'Migrate category reps finished with errors.');
    }
    mongoose.connection.close();
    process.exit();
  });
});
