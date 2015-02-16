#!/usr/bin/env node

var mongoose = require('mongoose');
var utils = require('./dataCollectionUtils.js');
var winston = require('winston');

// Set up the database url
var db = require('../config/db');
if (process.env.NODE_ENV === 'production') {
  winston.log('info', 'Starting store model data in production environment');
  var mongoURL = db.production_url;
} else {
  winston.log('info', 'Starting store model data in development environment');
  var mongoURL = db.development_url;
}

mongoose.connect(mongoURL);
mongoose.connection.on('connected', function() {
  utils.storeUserData(function(errs) {
    if (errs) {
      winston.log('info', 'Store user data finished with errors.');
    }
    utils.storeCategoryData(function(err) {
      if (errs) {
        winston.log('info', 'Store category data finished with errors.');
      }
      mongoose.connection.close();
      process.exit();
    });
  });
});
