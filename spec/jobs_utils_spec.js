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

  describe('migratePercentagesAndDividends: ', function() {
    var expert, investor1, investor2;
    beforeEach(function() {
      expert = {
        _id: '123',
        portfolio: [],
        categories: [
          {
            name: 'Coding',
            reps: 20,
            investors: [
              { id: '456' },
              { id: '789' },
            ]
          }
        ],
        save: jasmine.createSpy().andReturn()
      };

      investor1 = {
        _id: '456',
        portfolio: [
          {
            category: 'Coding',
            reps: 1,
            investments: [ { userId: '123', percentage: 100, amount: 5 } ]
          }
        ],
        save: jasmine.createSpy().andReturn()
      };

      investor2 = {
        _id: '789',
        portfolio: [
          {
            category: 'Coding',
            reps: 3,
            investments: [ { userId: '123', percentage: 75, amount: 15 } ]
          }
        ],
        save: jasmine.createSpy().andReturn()
      };

      users = [expert, investor1, investor2];
    });

    it('handles error finding users', function() {
      spyOn(User, 'find').andCallFake(function(cb) {
        return cb('Error', null);
      });
      utils.migratePercentagesAndDividends();
      expect(winston.log).toHaveBeenCalledWith('error',
        'Error migrating percentages and dividends: %s', 'Error');
      expect(users[1].portfolio[0].reps).toEqual(1);
      expect(users[2].portfolio[0].reps).toEqual(3);
    });

    it('divides percentages by 100 and adds accurate dividends', function() {
      spyOn(User, 'find').andCallFake(function(cb) {
        return cb(null, users);
      });

      utils.migratePercentagesAndDividends();
      expect(users[1].portfolio[0].investments[0].dividend).toEqual(2);
      expect(users[1].portfolio[0].investments[0].percentage).toEqual(1.00);
      expect(users[2].portfolio[0].investments[0].dividend).toEqual(1.5);
      expect(users[2].portfolio[0].investments[0].percentage).toEqual(0.75);
    });

    it('gives users a dividend of zero when expert cannot be found', function() {
      users[0]._id = 'XXX';
      spyOn(User, 'find').andCallFake(function(cb) {
        return cb(null, users);
      });

      utils.migratePercentagesAndDividends();
      expect(users[1].portfolio[0].investments[0].dividend).toEqual(0);
      expect(users[1].portfolio[0].investments[0].percentage).toEqual(1.00);
      expect(users[2].portfolio[0].investments[0].dividend).toEqual(0);
      expect(users[2].portfolio[0].investments[0].percentage).toEqual(0.75);
    });

    it('gives users a dividend of zero when expert category total cannot be calculated', function() {
      expert.categories = [];
      spyOn(User, 'find').andCallFake(function(cb) {
        return cb(null, users);
      });

      utils.migratePercentagesAndDividends();
      expect(users[1].portfolio[0].investments[0].dividend).toEqual(0);
      expect(users[1].portfolio[0].investments[0].percentage).toEqual(1.00);
      expect(users[2].portfolio[0].investments[0].dividend).toEqual(0);
      expect(users[2].portfolio[0].investments[0].percentage).toEqual(0.75);
    });
  });

  describe('payDividends: ', function() {
    var expert, investor1, investor2;
    beforeEach(function() {
      expert = {
        _id: '123',
        portfolio: [],
        categories: [
          {
            name: 'Coding',
            reps: 20,
            investors: [
              { id: '456' },
              { id: '789' },
            ]
          }
        ],
        save: jasmine.createSpy().andReturn()
      };

      investor1 = {
        _id: '456',
        portfolio: [
          {
            category: 'Coding',
            reps: 1,
            investments: [ { userId: '123', percentage: 1.00, amount: 5 } ]
          }
        ],
        save: jasmine.createSpy().andReturn()
      };

      investor2 = {
        _id: '789',
        portfolio: [
          {
            category: 'Coding',
            reps: 3,
            investments: [ { userId: '123', percentage: 0.75, amount: 15 } ]
          }
        ],
        save: jasmine.createSpy().andReturn()
      };

      users = [expert, investor1, investor2];
    });

    it('handles error finding users', function() {
      spyOn(User, 'find').andCallFake(function(cb) {
        return cb('Error', null);
      });
      utils.payDividends();
      expect(winston.log).toHaveBeenCalledWith('error',
        'Error paying dividends: %s', 'Error');
      expect(users[1].portfolio[0].reps).toEqual(1);
      expect(users[2].portfolio[0].reps).toEqual(3);
    });

    it('pays dividends and creates dividend field if not present', function() {
      spyOn(User, 'find').andCallFake(function(cb) {
        return cb(null, users);
      });

      utils.payDividends();
      expect(users[1].portfolio[0].reps).toEqual(3);
      expect(users[1].portfolio[0].investments[0].dividend).toEqual(2);
      expect(users[2].portfolio[0].reps).toEqual(4.5);
      expect(users[2].portfolio[0].investments[0].dividend).toEqual(1.5);
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
