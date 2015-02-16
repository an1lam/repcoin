var Category = require('../api/models/Category.js')
var mongoose = require('mongoose');
var routeUtils = require('../api/routes/utils.js');
var Schema = mongoose.Schema;
var User = require('../api/models/User.js');
var winston = require('winston');
var utils = require('../bin/dataCollectionUtils.js');

describe('Data collection utils: ', function() {
  var cb;
  beforeEach(function() {
    cb = jasmine.createSpy().andReturn();
    spyOn(winston, 'log').andCallFake(function(arg1, arg2, arg3, arg4) {
      return;
    });
  });

  afterEach(function() {
    expect(cb.callCount).toEqual(1);
  });

  describe('storeCategoryData: ', function() {
    var categories;

    it('handles error finding categories', function() {
      spyOn(Category, 'find').andCallFake(function(callback) {
        return callback('Error', null);
      });
      utils.storeCategoryData(cb);
      expect(winston.log).toHaveBeenCalledWith('error', 'Error collecting category data: %s', 'Error');
      expect(cb).toHaveBeenCalledWith('Error');
    });

    it('handles error from save all', function() {
      categories = [
        { _id: '123' },
        { _id: '456' },
      ];
      spyOn(Category, 'find').andCallFake(function(callback) {
        return callback(null, categories);
      });
      spyOn(routeUtils, 'saveAll').andCallFake(function(docs, callback) {
        return callback(['Error']);
      });
      utils.storeCategoryData(cb);
      expect(winston.log).toHaveBeenCalledWith('error', 'Error creating category stores: %s', 'Error');
      expect(cb).toHaveBeenCalledWith(['Error']);
    });

    it('creates a categorySnapshot for each category', function() {
      categories = [
        { _id: Schema.Types.ObjectId('123'), reps: 2, experts: 8, investors: 10 },
        { _id: Schema.Types.ObjectId('456'), reps: 1, experts: 5, investors: 12 },
      ];
      spyOn(Category, 'find').andCallFake(function(callback) {
        return callback(null, categories);
      });
      spyOn(routeUtils, 'saveAll').andCallFake(function(docs, callback) {
        return callback([]);
      });
      utils.storeCategoryData(cb);
      expect(winston.log).toHaveBeenCalledWith('info', 'Successfully created category stores.');
      expect(cb).toHaveBeenCalledWith(null);
    });
  });

  describe('storeUserData: ', function() {
    var users;

    it('handles error finding users', function() {
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback('Error', null);
      });
      utils.storeUserData(cb);
      expect(winston.log).toHaveBeenCalledWith('error', 'Error collecting user data: %s', 'Error');
      expect(cb).toHaveBeenCalledWith('Error');
    });

    it('handles error from save all', function() {
      users = [
        { _id: '123' },
        { _id: '456' },
      ];
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback(null, users);
      });
      spyOn(routeUtils, 'saveAll').andCallFake(function(docs, callback) {
        return callback(['Error']);
      });
      utils.storeUserData(cb);
      expect(winston.log).toHaveBeenCalledWith('error', 'Error creating user stores: %s', 'Error');
      expect(cb).toHaveBeenCalledWith(['Error']);
    });

    it('creates a userSnapshot for each user', function() {
      users = [
        { _id: Schema.Types.ObjectId('123'), reps: 2, portfolio: [], categories: [] },
        { _id: Schema.Types.ObjectId('456'), reps: 1, portfolio: [], categories: [] },
      ];
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback(null, users);
      });
      spyOn(routeUtils, 'saveAll').andCallFake(function(docs, callback) {
        return callback([]);
      });
      utils.storeUserData(cb);
      expect(winston.log).toHaveBeenCalledWith('info', 'Successfully created user stores.');
      expect(cb).toHaveBeenCalledWith(null);
    });
  });
});
