var winston = require('winston');
var routeUtils = require('../api/routes/utils.js');
var utils = require('../bin/utils.js');

var Category = require('../api/models/Category.js');
var Transaction = require('../api/models/Transaction.js');
var User = require('../api/models/User.js');

describe('Job utils: ', function() {
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

  describe('recountCategoryRepsExpertsAndInvestors: ', function() {
    var users, category;
    beforeEach(function() {
      category = { name: 'Coding', reps: 0 };
      users = [
        { categories: [{name: 'Coding', reps: 5 }, { name: 'Ballet', reps: 10 }], portfolio: [] },
        { categories: [{name: 'Coding', reps: 6 }], portfolio: [ { category: 'Coding', reps: 10 } ] },
        { categories: [{name: 'Foobar', reps: 6 }], portfolio: [ { category: 'Coding' } ] },
      ];
    });

    it('handles error finding users', function() {
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback('Error', null);
      });
      utils.recountCategoryRepsExpertsAndInvestors(cb);
      expect(winston.log).toHaveBeenCalledWith('error', 'Error migrating category reps: %s', 'Error');
      expect(category.reps).toEqual(0);
    });

    it('handles error finding categories', function() {
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback(null, users);
      });
      spyOn(Category, 'find').andCallFake(function(callback) {
        return callback('Error', null);
      });
      utils.recountCategoryRepsExpertsAndInvestors(cb);
      expect(winston.log).toHaveBeenCalledWith('error', 'Error migrating category reps: %s', 'Error');
      expect(category.reps).toEqual(0);
    });

    it('makes category reps the sum of expert reps in that category', function() {
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback(null, users);
      });
      spyOn(Category, 'find').andCallFake(function(callback) {
        return callback(null, [category]);
      });
      spyOn(routeUtils, 'saveAll').andCallFake(function(categories, callback) {
        return callback([]);
      });
      utils.recountCategoryRepsExpertsAndInvestors(cb);
      expect(category.reps).toEqual(11);
      expect(category.experts).toEqual(2);
      expect(category.investors).toEqual(2);
    });
  });

  describe('migrateInvestorReps: ', function() {
    var investor;
    beforeEach(function() {
      investor = { reps: 0, portfolio: [{ reps: 10 }, { reps: 15 }] };
    });

    it('handles error finding users', function() {
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback('Error', null);
      });
      utils.migrateInvestorReps(cb);
      expect(winston.log).toHaveBeenCalledWith('error', 'Error migrating investor reps: %s', 'Error');
      expect(investor.reps).toEqual(0);
    });

    it('makes investor reps the sum of portfolio reps', function() {
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback(null, [investor]);
      });
      spyOn(routeUtils, 'saveAll').andCallFake(function(users, callback) {
        return callback([]);
      });

      utils.migrateInvestorReps(cb);
      expect(investor.reps).toEqual(25);
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
        reps: 1,
        portfolio: [
          {
            category: 'Coding',
            investments: [ { userId: '123', percentage: 100, amount: 5 } ]
          }
        ],
        save: jasmine.createSpy().andReturn()
      };

      investor2 = {
        _id: '789',
        reps: 3,
        portfolio: [
          {
            category: 'Coding',
            investments: [ { userId: '123', percentage: 75, amount: 15 } ]
          }
        ],
        save: jasmine.createSpy().andReturn()
      };

      users = [expert, investor1, investor2];
    });

    it('handles error finding users', function() {
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback('Error', null);
      });
      utils.migratePercentagesAndDividends(cb);
      expect(winston.log).toHaveBeenCalledWith('error',
        'Error migrating percentages and dividends: %s', 'Error');
      expect(users[1].reps).toEqual(1);
      expect(users[2].reps).toEqual(3);
    });

    it('divides percentages by 100 and adds accurate dividends', function() {
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback(null, users);
      });
      spyOn(routeUtils, 'saveAll').andCallFake(function(users, callback) {
        return callback([]);
      });

      utils.migratePercentagesAndDividends(cb);
      expect(users[1].portfolio[0].investments[0].dividend).toEqual(2);
      expect(users[1].portfolio[0].investments[0].percentage).toEqual(1.00);
      expect(users[2].portfolio[0].investments[0].dividend).toEqual(1.5);
      expect(users[2].portfolio[0].investments[0].percentage).toEqual(0.75);
    });

    it('gives users a dividend of zero when expert cannot be found', function() {
      users[0]._id = 'XXX';
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback(null, users);
      });
      spyOn(routeUtils, 'saveAll').andCallFake(function(users, callback) {
        return callback([]);
      });

      utils.migratePercentagesAndDividends(cb);
      expect(users[1].portfolio[0].investments[0].dividend).toEqual(0);
      expect(users[1].portfolio[0].investments[0].percentage).toEqual(1.00);
      expect(users[2].portfolio[0].investments[0].dividend).toEqual(0);
      expect(users[2].portfolio[0].investments[0].percentage).toEqual(0.75);
    });

    it('gives users a dividend of zero when expert category total cannot be calculated', function() {
      expert.categories = [];
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback(null, users);
      });
      spyOn(routeUtils, 'saveAll').andCallFake(function(users, callback) {
        return callback([]);
      });

      utils.migratePercentagesAndDividends(cb);
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
            reps: 20.17,
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
        reps: 1,
        portfolio: [
          {
            category: 'Coding',
            investments: [ { userId: '123', percentage: 1.00, amount: 5 } ]
          }
        ],
        save: jasmine.createSpy().andReturn()
      };

      investor2 = {
        _id: '789',
        reps: 3,
        portfolio: [
          {
            category: 'Coding',
            investments: [ { userId: '123', percentage: 0.75, amount: 15 } ]
          }
        ],
        save: jasmine.createSpy().andReturn()
      };

      users = [expert, investor1, investor2];
    });

    it('handles error finding users', function() {
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback('Error', null);
      });
      utils.payDividends(cb);
      expect(winston.log).toHaveBeenCalledWith('error',
        'Error paying dividends: %s', 'Error');
      expect(users[1].reps).toEqual(1);
      expect(users[2].reps).toEqual(3);
    });

    it('pays dividends and creates dividend field if not present, rounding to nearest hundredth', function() {
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback(null, users);
      });
      spyOn(routeUtils, 'saveAll').andCallFake(function(users, callback) {
        return callback([]);
      });

      utils.payDividends(cb);
      expect(users[1].reps).toEqual(3.01);
      expect(users[1].portfolio[0].investments[0].dividend).toEqual(2.01);
      expect(users[2].reps).toEqual(4.51);
      expect(users[2].portfolio[0].investments[0].dividend).toEqual(1.51);
    });
  });

  describe('incrementInvestorReps: ', function() {
    var users;
    beforeEach(function() {
      users = [
        { _id: '123', reps: 0, portfolio: [ { category: 'Coding' } ], save: jasmine.createSpy().andReturn() },
        { _id: '456', reps: 3.299, portfolio: [ { category: 'Coding' } ], save: jasmine.createSpy().andReturn() },
      ];
    });

    it('handles error finding users', function() {
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback('Error', null);
      });
      utils.incrementInvestorReps(cb);
      expect(winston.log).toHaveBeenCalledWith('error',
        'Error incrementing investor reps: %s', 'Error');
      expect(users[0].reps).toEqual(0);
      expect(users[1].reps).toEqual(3.299);
    });

    it('increments investor reps and category reps, rounding to nearest hundredth', function() {
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback(null, users);
      });
      spyOn(routeUtils, 'saveAll').andCallFake(function(users, callback) {
        return callback([]);
      });

      utils.incrementInvestorReps(cb);
      expect(users[0].reps).toEqual(5);
      expect(users[1].reps).toEqual(3.29);
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
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback('Error', null);
      });
      utils.setPreviousPercentileToCurrent(cb);
      expect(winston.log).toHaveBeenCalledWith('error',
        'Error setting previous percentiles to current: %s', 'Error');
      expect(users[0].categories[0].percentile).toEqual(24);
      expect(users[1].categories[0].percentile).toEqual(40);
    });

    it('sets previous percentiles to percentiles', function() {
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback(null, users);
      });
      spyOn(routeUtils, 'saveAll').andCallFake(function(users, callback) {
        return callback([]);
      });

      utils.setPreviousPercentileToCurrent(cb);
      expect(users[0].categories[0].previousPercentile).toEqual(
        users[0].categories[0].percentile);
      expect(users[1].categories[0].previousPercentile).toEqual(
        users[1].categories[0].percentile);
    });
  });

  describe('makeCategoryNamesLowerCase: ', function() {
    var users;
    beforeEach(function() {
      users = [
        {
          _id: '123',
          portfolio: [
            { category: 'Foo' }
          ],
          categories: [
            { name: 'Foo' }
          ],
          save: jasmine.createSpy().andReturn()
        }
      ];

      transactions = [{category: 'Foo'}];
      categories = [{name: 'Foo'}];
    });

    it('converts category names to lower case', function() {
      spyOn(User, 'find').andCallFake(function(callback) {
        return callback(null, users);
      });
      spyOn(Transaction, 'find').andCallFake(function(callback) {
        return callback(null, transactions);
      });
      spyOn(Category, 'find').andCallFake(function(callback) {
        return callback(null, categories);
      });
      spyOn(routeUtils, 'saveAll').andCallFake(function(users, callback) {
        return callback([]);
      });
      utils.makeCategoryNamesLowerCase(cb);
      expect(users[0].portfolio[0].category).toEqual('foo');
      expect(users[0].categories[0].name).toEqual('foo');
      expect(transactions[0].category).toEqual('foo');
      expect(categories[0].name).toEqual('foo');
    });
  });
});
