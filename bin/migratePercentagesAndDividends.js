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
  var mongoURL = db.production_url;
}
mongoose.connect(mongoURL);

utils.migratePercentagesAndDividends();
process.exit();
