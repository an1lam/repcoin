'use strict';
var Category = require('../api/models/Category.js');
var CategoryStore = require('../api/models/CategoryStore.js');
var User = require('../api/models/User.js');
var UserStore = require('../api/models/UserStore.js');
var routeUtils = require('../api/routes/utils.js');
var winston = require('winston');

// Utility functions for data collection
var dataCollectionUtils = {
  storeCategoryData: function(cb) {
    Category.find(function(err, categories) {
      if (err) {
        winston.log('error', 'Error collecting category data: %s', err.toString());
        return cb(err);
      }
      var len = categories.length;
      var category, categoryStore;
      var categoryStores = [];
      for (var i = 0; i < len; i++) {
        category = categories[i];
        categoryStores.push(new CategoryStore({
          id          : category._id,
          name        : category.name,
          reps        : category.reps,
          experts     : category.experts,
          investors   : category.investors,
        }));
      }
      routeUtils.saveAll(categoryStores, function(errs) {
        if (errs.length > 0) {
          winston.log('error', 'Error creating category stores: %s', errs.toString());
          cb(errs);
        } else {
          winston.log('info', 'Successfully created category stores.');
          cb(null);
        }
      });
    });
  },

  storeUserData: function(cb) {
    User.find(function(err, users) {
      if (err) {
        winston.log('error', 'Error collecting user data: %s', err.toString());
        return cb(err);
      }
      var len = users.length;
      var user, userStore;
      var userStores = [];
      for (var i = 0; i < len; i++) {
        user = users[i];
        userStores.push(new UserStore({
          id          : user._id,
          reps        : user.reps,
          portfolio   : user.portfolio,
          categories  : user.categories,
        }));
      }
      routeUtils.saveAll(userStores, function(errs) {
        if (errs.length > 0) {
          winston.log('error', 'Error creating user stores: %s', errs.toString());
          cb(errs);
        } else {
          winston.log('info', 'Successfully created user stores.');
          cb(null);
        }
      });
    });
  },
};

module.exports = dataCollectionUtils;
