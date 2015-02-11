#!/usr/bin/env node

var mongoose = require('mongoose');
var utils = require('./utils.js');
var winston = require('winston');

// Set up the database url
var db = require('../config/db');

var exit = function() {
  mongoose.connection.close();
  process.exit();
};

if (process.env.NODE_ENV === 'production') {
  winston.log('info', 'Starting to clean alpha data in production environment');
  var mongoURL = db.production_url;
} else {
  winston.log('info', 'Starting to clean alpha data in development environment');
  var mongoURL = db.development_url;
}
mongoose.connect(mongoURL);
mongoose.connection.on('connected', function() {
  utils.removeInappropriateCategories(function(errs) {
    if (errs) {
      winston.log('info', 'Remove inappropriate categories finished with errors.');
      winston.log(errs);
    }
    utils.removeInappropriateUsers(function(errs) {
      if (errs) {
        winston.log('info', 'Remove inappropriate users finished with errors.');
        winston.log(errs);
      }
      utils.recountCategoryRepsExpertsAndInvestors(function(errs) {
        if (errs) {
          winston.log('info', 'Migrate category reps finished with errors.');
          winston.log(errs);
        }
        exit();
      });
    });
  });
});
