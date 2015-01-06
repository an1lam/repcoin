var winston = require('winston');
var Category = require('../api/models/Category.js');
var User = require('../api/models/User.js');
var utils = require('../api/jobs/utils.js');

describe('Job utils: ', function() {
  beforeEach(function() {
    spyOn(winston, 'log').andCallFake(function(arg1, arg2, arg3, arg4) {
      return;
    });
  });

  describe('incrementInvestorReps: ', function() {
    var users, categoryPromise;
    beforeEach(function() {
      users = [
        { _id: '123', portfolio: [ { category: 'Coding', reps: 0 } ], save: jasmine.createSpy().andReturn() },
        { _id: '456', portfolio: [ { category: 'Coding', reps: 3 } ], save: jasmine.createSpy().andReturn() },
      ];

      categoryPromise = {
        category: {
          name: 'Coding',
          reps: 7,
          save: jasmine.createSpy().andReturn()
        },
        then: function(cb) {
          return cb(this.category);
        }
      };
      spyOn(Category, 'findByName').andReturn(categoryPromise);
    });

    it('handles error finding users', function() {
      spyOn(User, 'find').andCallFake(function(cb) {
        return cb('Error', null);
      });
      utils.incrementInvestorReps();
      expect(winston.log).toHaveBeenCalledWith('error',
        'Error incrementing investor reps: %s', 'Error');
      expect(users[0].portfolio[0].reps).toEqual(0);
      expect(users[1].portfolio[0].reps).toEqual(3);
      expect(categoryPromise.category.reps).toEqual(7);
    });

    it('increments investor reps if they have none left and increments category reps', function() {
      spyOn(User, 'find').andCallFake(function(cb) {
        return cb(null, users);
      });
      utils.incrementInvestorReps();
      expect(users[0].portfolio[0].reps).toEqual(5);
      expect(users[1].portfolio[0].reps).toEqual(3);
      expect(categoryPromise.category.reps).toEqual(12);
    });
  });

  describe('setPreviousPercentileToCurrent: ', function() {
    var users;
    beforeEach(function() {
      users = [
        {
          _id: '123',
          categories: [ { name: 'Foo', percentile: 24, previousPercentile: 30 } ],
          save: jasmine.createSpy().andReturn()
        },
        {
          _id: '456',
          categories: [ { name: 'Bar', percentile: 40, previousPercentile: 19 } ],
          save: jasmine.createSpy().andReturn()
        },
      ];
    });

    it('handles error finding users', function() {
      spyOn(User, 'find').andCallFake(function(cb) {
        return cb('Error', null);
      });
      utils.setPreviousPercentileToCurrent();
      expect(winston.log).toHaveBeenCalledWith('error',
        'Error setting previous percentiles to current: %s', 'Error');
      expect(users[0].categories[0].percentile).toEqual(24);
      expect(users[1].categories[0].percentile).toEqual(40);
    });

    it('sets previous percentiles to percentiles', function() {
      spyOn(User, 'find').andCallFake(function(cb) {
        return cb(null, users);
      });
      utils.setPreviousPercentileToCurrent();
      expect(users[0].categories[0].previousPercentile).toEqual(
        users[0].categories[0].percentile);
      expect(users[1].categories[0].previousPercentile).toEqual(
        users[1].categories[0].percentile);
    });
  });
});
