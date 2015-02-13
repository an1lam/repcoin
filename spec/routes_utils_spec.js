process.env.NODE_ENV = 'test';
var utils = require('../api/routes/utils.js');
var urlConfig = require('../config/url.js');
var winston = require('winston');

var Category = require('../api/models/Category.js');
var Transaction = require('../api/models/Transaction.js');
var User = require('../api/models/User.js');

describe('Utils: ', function() {
  beforeEach(function() {
    spyOn(winston, 'log').andCallFake(function(arg1, arg2, arg3, arg4) {
      return;
    });
  });

  describe('getTotalDividends: ', function() {
    it('adds up the dividend from each investment', function() {
      var portfolioEntry = { investments: [ { dividend: 1 }, { dividend: 3 } ] };
      var totalDividends = utils.getTotalDividends(portfolioEntry);
      expect(totalDividends).toEqual(4);
    });

    it('returns 0 if the entry has no investments', function() {
      var portfolioEntry = {};
      var totalDividends = utils.getTotalDividends(portfolioEntry);
      expect(totalDividends).toEqual(0);
    });
  });

  describe('isExpert: ', function() {
    var user = { categories: [{ name: 'Coding' }] };
    it('returns true if the user is an expert', function() {
      var result = utils.isExpert(user, 'Coding');
      expect(result).toEqual(true);
    });

    it('returns false if the user is not an expert', function() {
      var result = utils.isExpert(user, 'Ballet');
      expect(result).toEqual(false);
    });
  });

  describe('isInvestor: ', function() {
    var user = { portfolio: [{ category: 'Coding' }] };
    it('returns true if the user is an investor', function() {
      var result = utils.isInvestor(user, 'Coding');
      expect(result).toEqual(true);
    });

    it('returns false if the user is not an investor', function() {
      var result = utils.isInvestor(user, 'Ballet');
      expect(result).toEqual(false);
    });
  });

  describe('getInvestors: ', function() {
    var user = { categories: [{ name: 'Coding', investors: ['foo']}] };
    it('returns investors for a user categoryName', function() {
      var result = utils.getInvestors(user, 'Coding');
      expect(result).toEqual(['foo']);
    });

    it('returns null when no investors are found', function() {
      var result = utils.getInvestors(user, 'Ballet');
      expect(result).toEqual(null);
    });
  });

  describe('undoInvestorActivityForCategory: ', function() {
    var category, investor;
    beforeEach(function() {
      category = { name: 'Coding', reps: 100 };
      cb = jasmine.createSpy();
    });

    afterEach(function() {
      expect(cb.callCount).toEqual(1);
    });

    var investors = [
      { id: '123' },
      { id: '456' }
    ];
    var users = [{ categories: [{ name: 'Coding', reps: 5, investors: investors }] }];

    it('handles error finding investments', function() {
      var investor = { portfolio: [] };
      utils.undoInvestorActivityForCategory(category, investor, cb);
      expect(cb).toHaveBeenCalledWith('Error finding investments', null);
    });

    it('handles error finding investor\'s experts', function() {
      var investor = { _id: 'Matt', reps: 50, portfolio: [{ category: 'Coding', investments: [{ amount: 5, userId: '123' }] }] };
      spyOn(User, 'find').andCallFake(function(query, cb) {
        return cb('Error', null);
      });
      utils.undoInvestorActivityForCategory(category, investor, cb);
      expect(cb).toHaveBeenCalledWith('Error finding investors experts', null);
    });

    it('handles error saving documents', function() {
      var investor = { _id: 'Matt', reps: 50, portfolio: [{ category: 'Coding', investments: [{ amount: 5, userId: '123' }] }] };
      spyOn(User, 'find').andCallFake(function(query, cb) {
        return cb(null, []);
      });
      spyOn(utils, 'saveAll').andCallFake(function(docs, cb) {
        return cb(['Error']);
      });
      utils.undoInvestorActivityForCategory(category, investor, cb);
      expect(cb).toHaveBeenCalledWith(['Error'], null);
    });

    it('undoes all of the investor\'s activity', function() {
      var investments = [
        { amount: 7, userId: '123' },
        { amount: 4, userId: '456' },
      ];
      var investor = { _id: '000', reps: 50, portfolio: [{ category: 'Coding', investments: investments }] };
      var experts = [
        { _id: '123', categories: [{ name: 'Coding', investors: [{ id: '777'}, { id: '000' }], reps: 70 }]},
        { _id: '456', categories: [{ name: 'Coding', investors: [{ id: '788'}, { id: '000' }], reps: 21 }]},
        { _id: '789', categories: [{ name: 'Coding', investors: [{ id: '799'}], reps: 21 }]},
      ];
      spyOn(User, 'find').andCallFake(function(selector, cb) {
        return cb(null, experts);
      });
      spyOn(utils, 'saveAll').andCallFake(function(users, cb) {
        return cb([]);
      });

      utils.undoInvestorActivityForCategory(category, investor, cb);

      var expectedExperts = [
        { _id: '123', categories: [{ name: 'Coding', investors: [{ id: '777'}], reps: 63 }]},
        { _id: '456', categories: [{ name: 'Coding', investors: [{ id: '788'}], reps: 17 }]},
        { _id: '789', categories: [{ name: 'Coding', investors: [{ id: '799'}], reps: 21 }]},
      ];
      var expectedCategory = { name: 'Coding', reps: 89 };
      var expectedInvestor = { _id: '000', reps: 61, portfolio: [] };

      expect(investor).toEqual(expectedInvestor);
      expect(experts).toEqual(expectedExperts);
      expect(category).toEqual(expectedCategory);
      expect(cb).toHaveBeenCalledWith(null, expectedInvestor);
    });
  });

  describe('reimburseInvestors: ', function() {
    beforeEach(function() {
      cb = jasmine.createSpy();
    });

    var investments = [
      { userId: '123', amount: 5 },
      { userId: '456', amount: 6 }
    ];
    var users = [{ portfolio: [{ category: 'Coding', reps: 0, investments: investments }] }];
    it('reimburses investors', function() {
      spyOn(utils, 'saveAll').andCallFake(function(users, cb) {
        return cb([]);
      });
      spyOn(User, 'find').andCallFake(function(selector, cb) {
        return cb(null, users);
      });
      var investors = [ { name: 'Foo', id: 'bar' }];

      var expectedUsers = [{ portfolio: [{ category: 'Coding', reps: 5, investments: [investments[1]] }] }];
      utils.reimburseInvestors(investors, 'Coding', '123', cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
      expect(utils.saveAll).toHaveBeenCalledWith(expectedUsers, jasmine.any(Function));
    });

    it('handles error from finding investors', function() {
      spyOn(User, 'find').andCallFake(function(selector, cb) {
        return cb('ERROR!', null);
      });

      var investors = [ { name: 'Foo', id: 'bar' }];
      utils.reimburseInvestors(investors, 'Coding', '123', cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith('ERROR!');
    });

    it('handles error from saving investors', function() {
      spyOn(User, 'find').andCallFake(function(selector, cb) {
        return cb(null, users);
      });
      spyOn(utils, 'saveAll').andCallFake(function(users, cb) {
        return cb(['ERROR!']);
      });

      var investors = [ { name: 'Foo', id: 'bar' }];
      utils.reimburseInvestors(investors, 'Coding', '123', cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(['ERROR!']);
    });

    it('handles empty list of investors', function() {
      utils.reimburseInvestors([], 'Coding', '123', cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
    });
  });

  describe('removeInvestor: ', function() {
    it('removes the investor for the given category', function() {
      var investors = [
        { id: '123', name: 'Bob' },
        { id: '456', name: 'Matt' }
      ];
      var expert = { categories: [{ name: 'Coding', reps: 10, investors: investors }] };
      var result = utils.removeInvestor(expert, 'Coding', '123');
      var expected = { categories: [{ name: 'Coding', reps: 10, investors: [investors[1]] }] };
      expect(result).toEqual(expected);
    });

    it('removes the reps from the expert if an amount is provided', function() {
      var investors = [
        { id: '123', name: 'Bob' },
        { id: '456', name: 'Matt' }
      ];
      var expert = { categories: [{ name: 'Coding', reps: 10, investors: investors }] };
      var result = utils.removeInvestor(expert, 'Coding', '123', 4);
      var expected = { categories: [{ name: 'Coding', reps: 6, investors: [investors[1]] }] };
      expect(result).toEqual(expected);
    });
  });

  describe('reimburseInvestor: ', function() {
    it('reimburses investments pertaining to this user and category', function() {
      var investments = [
        { userId: '123', amount: 5 },
        { userId: '456', amount: 6 }
      ];
      var investor = { portfolio: [{ category: 'Coding', reps: 0, investments: investments }] };
      var result = utils.reimburseInvestor(investor, 'Coding', '123');
      var expected = { portfolio: [{ category: 'Coding', reps: 5, investments: [investments[1]] }] };
      expect(result).toEqual(expected);
    });
  });

  describe('deleteExpertCategory: ', function() {
    it('deletes the category from the expert categories', function() {
      var user = { categories: [{ name: 'Coding' }] };
      var result = utils.deleteExpertCategory(user, 'Coding');
      expect(result).toEqual({ categories: [] });
    });

    it('resets the defaultCategory if it was the deleted category', function() {
      var user = { defaultCategory: 'Coding', categories: [{ name: 'Coding' }] };
      var result = utils.deleteExpertCategory(user, 'Coding');
      expect(result).toEqual({ defaultCategory: undefined, categories: [] });
    });
  });

  describe('validateUserLinks: ', function() {
    it('returns true if inputs are correct', function() {
      var links = [{ title: 'foo', url: 'bar' }];
      var result = utils.validateUserLinks(links);
      expect(result).toEqual(true);
    });

    it('returns false if a title is incorrect', function() {
      var links = [{ title: '', url: 'bar' }];
      var result = utils.validateUserLinks(links);
      expect(result).toEqual(false);

      links = [{ url: 'bar' }];
      result = utils.validateUserLinks(links);
      expect(result).toEqual(false);
    });

    it('returns false if a url is incorrect', function() {
      var links = [{ title: 'foo', url: '' }];
      var result = utils.validateUserLinks(links);
      expect(result).toEqual(false);

      links = [{ title: 'foo' }];
      result = utils.validateUserLinks(links);
      expect(result).toEqual(false);
    });

    it('returns true if links are meant to be empty', function() {
      var links = ['EMPTY'];
      var result = utils.validateUserLinks(links);
      expect(result).toEqual(true);
    });
  });

  describe('validateUserInputs: ', function() {
    it('returns true if inputs are correct', function() {
      var req = { body: { about: 'Hello!' }};
      var result = utils.validateUserInputs(req);
      expect(result).toEqual(true);
    });

    it('returns false if about is incorrect', function() {
      var req = { body: { about: '    ' }};
      var result = utils.validateUserInputs(req);
      expect(result).toEqual(false);
    });

    it('returns false if picture is incorrect', function() {
      var req = { body: { about: 'Hello!', picture: { url: 'foo'} }};
      var result = utils.validateUserInputs(req);
      expect(result).toEqual(false);
    });

  });

  describe('validateTransactionInputs: ', function() {
    var req;
    beforeEach(function() {
      req = {
        user : { _id: '1' },
        body : {
          from      : { id: '1', name: 'foo' },
          to        : { id: '2', name: 'bar' },
          amount    : 10,
          category  : 'foo'
        },
      };
    });

    it('returns true if inputs are correct', function() {
      var result = utils.validateTransactionInputs(req);
      expect(result).toEqual(true);
    });

    it('returns false is amount is 0', function() {
      req.body.amount = 0;
      var result = utils.validateTransactionInputs(req);
      expect(result).toEqual(false);
    });

    it('returns false if amount is past hundredths place', function() {
      req.body.amount = 10.152;
      var result = utils.validateTransactionInputs(req);
      expect(result).toEqual(false);
    });

    it('returns false is amount is not a number', function() {
      req.body.amount = 'foo';
      var result = utils.validateTransactionInputs(req);
      expect(result).toEqual(false);
    });

    it('returns false if no id is supplied for a revoke', function() {
      req.body.amount = -1;
      var result = utils.validateTransactionInputs(req);
      expect(result).toEqual(false);
    });

  });

  describe('updateExpertPercentiles: ', function() {
    beforeEach(function() {
      cb = jasmine.createSpy();
    });
    var category = 'Coding';
    var expertsPromise = {
      experts: [
        { _id: '1', categories: [ { name: category, reps: 9, percentile: 50 }] },
        { _id: '2', categories: [ { name: category, reps: 1, percentile: 50 }] },
        { _id: '3', categories: [ { name: category, reps: 8, percentile: 50 }] },
        { _id: '4', categories: [ { name: category, reps: 5, percentile: 50 }] },
      ],

      then: function(cb) {
        return cb(this.experts);
      }
    };

    it('should correctly update percentiles for some experts', function() {
      spyOn(User, 'findExpertByCategory').andReturn(expertsPromise);
      spyOn(utils, 'saveAll').andCallFake(function(experts, cb) {
        return cb([]);
      });
      spyOn(utils, 'getExpertPercentiles').andCallFake(function(experts, category, cb) {
        return cb(null);
      });
      utils.updateExpertPercentiles(category, cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
    });

    it('should correctly handle error from getExpertPercentiles', function() {
      spyOn(User, 'findExpertByCategory').andReturn(expertsPromise);
      spyOn(utils, 'saveAll').andCallFake(function(experts, cb) {
        return cb([]);
      });
      spyOn(utils, 'getExpertPercentiles').andCallFake(function(experts, category, cb) {
        return cb('getExpertPercentile error');
      });
      utils.updateExpertPercentiles(category, cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith('getExpertPercentile error');
    });

    it('should correctly handle error from saveAll()', function() {
      spyOn(User, 'findExpertByCategory').andReturn(expertsPromise);
      var errs = ['Error from saveAll()'];
      spyOn(utils, 'saveAll').andCallFake(function(experts, cb) {
        return cb(errs);
      });
      spyOn(utils, 'getExpertPercentiles').andCallFake(function(experts, category, cb) {
        return cb(null);
      });
      utils.updateExpertPercentiles(category, cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(errs);
    });
  });

  describe('updatePercentilesAndDividends: ', function() {
    var cb, realUpdateExpertPercentiles, realUpdateInvestorPercentiles, expert, categoryName;

    beforeEach(function() {
      cb = jasmine.createSpy();
      realUpdateExpertPercentiles = utils.updateExpertPercentiles;
      realUpdateInvestorPercentiles = utils.updateInvestorPercentilesAndDividends;
    });

    afterEach(function() {
      expect(cb.callCount).toEqual(1);
      utils.updateExpertDividends = realUpdateExpertPercentiles;
      utils.updateInvestorPercentilesAndDividends = realUpdateInvestorPercentiles;
    });

    it('handles the expert not having the expected category', function() {
      categoryName = 'Coding';
      expert = { categories: [] };
      utils.updatePercentilesAndDividends(categoryName, expert, cb);
      expect(cb).toHaveBeenCalledWith('User is not an expert in this category');
    });

    it('allows the expert to be null', function() {
      categoryName = 'Coding';
      expert = null;
      utils.updateInvestorPercentilesAndDividends = jasmine.createSpy().andCallFake(function(categoryName, callback, expertName, expertReps) {
        return callback(null);
      });
      utils.updateExpertPercentiles = jasmine.createSpy().andCallFake(function(categoryName, callback) {
        return callback(null);
      });
      utils.updatePercentilesAndDividends(categoryName, expert, cb);
      expect(cb).toHaveBeenCalledWith(null);
    });

    it('handles error updating investor percentiles and dividends', function() {
      categoryName = 'Coding';
      expert = { categories: [ { name: 'Coding' } ] };
      utils.updateInvestorPercentilesAndDividends = jasmine.createSpy().andCallFake(function(categoryName, callback, expertName, expertReps) {
        return callback('Error');
      });
      utils.updatePercentilesAndDividends(categoryName, expert, cb);
      expect(cb).toHaveBeenCalledWith('Error');
    });

    it('handles error updating expert percentiles', function() {
      categoryName = 'Coding';
      expert = { categories: [ { name: 'Coding' } ] };
      utils.updateInvestorPercentilesAndDividends = jasmine.createSpy().andCallFake(function(categoryName, callback, expertName, expertReps) {
        return callback(null);
      });
      utils.updateExpertPercentiles = jasmine.createSpy().andCallFake(function(categoryName, callback) {
        return callback('Error');
      });
      utils.updatePercentilesAndDividends(categoryName, expert, cb);
      expect(cb).toHaveBeenCalledWith('Error');
    });

    it('updates all percentiles', function() {
      categoryName = 'Coding';
      expert = { categories: [ { name: 'Coding' } ] };
      utils.updateInvestorPercentilesAndDividends = jasmine.createSpy().andCallFake(function(categoryName, callback, expertName, expertReps) {
        return callback(null);
      });
      utils.updateExpertPercentiles = jasmine.createSpy().andCallFake(function(categoryName, callback) {
        return callback(null);
      });
      utils.updatePercentilesAndDividends(categoryName, expert, cb);
      expect(cb).toHaveBeenCalledWith(null);
    });

  });

  describe('updateInvestorPercentilesAndDividends: ', function() {
    var cb, realUpdateDividends, realUpdatePercentiles, realSaveAll;
    var category = 'Coding';
    var expertName = 'Matt';
    var expertReps = 10;

    beforeEach(function() {
      cb = jasmine.createSpy();
      realUpdateDividends = utils.updateDividends;
      realUpdatePercentiles = utils.updateInvestorPercentiles;
      realSaveAll = utils.saveAll;
    });

    afterEach(function() {
      expect(cb.callCount).toEqual(1);
      utils.updateDividends = realUpdateDividends;
      utils.updateInvestorPercentiles = realUpdatePercentiles;
      utils.saveAll = realSaveAll;
    });

    var investors = [
      { _id: '1', portfolio: [ { category: category, percentile: 50, investments: [{ dividend: 1 }] }] },
      { _id: '2', portfolio: [ { category: category, percentile: 50, investments: [{ dividend: 1 }] }] },
      { _id: '3', portfolio: [ { category: category, percentile: 50, investments: [{ dividend: 1 }] }] },
      { _id: '4', portfolio: [ { category: category, percentile: 50, investments: [{ dividend: 1 }] }] },
    ];

    var investorsPromise = {
      investors: investors,

      then: function(cb) {
        return cb(this.investors);
      }
    };

    it('should correctly update percentiles for some investors', function() {
      utils.updateDividends = jasmine.createSpy().andReturn(investors);
      utils.updateInvestorPercentiles = jasmine.createSpy().andCallFake(function(investors, category, cb) {
        return cb(null);
      });
      utils.saveAll = jasmine.createSpy().andCallFake(function(docs, callback) {
        return callback([]);
      });
      spyOn(User, 'findInvestorByCategory').andReturn(investorsPromise);
      utils.updateInvestorPercentilesAndDividends(category, cb, expertName, expertReps);
      expect(cb).toHaveBeenCalledWith(null);
    });

    it('should correctly handle error from updateInvestorPercentiles', function() {
      utils.updateDividends = jasmine.createSpy().andReturn(investors);
      utils.updateInvestorPercentiles = jasmine.createSpy().andCallFake(function(investors, category, cb) {
        return cb('getInvestorPercentile error');
      });
      utils.saveAll = jasmine.createSpy().andCallFake(function(docs, callback) {
        return callback([]);
      });
      spyOn(User, 'findInvestorByCategory').andReturn(investorsPromise);
      utils.updateInvestorPercentilesAndDividends(category, cb, expertName, expertReps);
      expect(cb).toHaveBeenCalledWith('getInvestorPercentile error');
    });

    it('should correctly handle error from saveAll()', function() {
      utils.updateDividends = jasmine.createSpy().andReturn(investors);
      utils.updateInvestorPercentiles = jasmine.createSpy().andCallFake(function(investors, category, cb) {
        return cb(null);
      });
      utils.saveAll = jasmine.createSpy().andCallFake(function(docs, callback) {
        return callback(['Error from saveAll()']);
      });
      spyOn(User, 'findInvestorByCategory').andReturn(investorsPromise);

      utils.updateInvestorPercentilesAndDividends(category, cb, expertName, expertReps);
      expect(cb).toHaveBeenCalledWith(['Error from saveAll()']);
    });
  });

  describe('dividendsComparator: ', function() {
    it('should correctly sort users by dividends in increasing order', function() {
      var users = [
        { _id: '1', portfolio: [ { category: 'Coding', investments: [{ dividend: 3 }] }] },
        { _id: '2', portfolio: [ { category: 'Coding', investments: [{ dividend: 5 }] }] },
        { _id: '3', portfolio: [ { category: 'Coding', investments: [{ dividend: 3 }] }] },
        { _id: '4', portfolio: [ { category: 'Coding', investments: [{ dividend: 1 }] }] },
      ];

      var expected = [
        { _id: '4', portfolio: [ { category: 'Coding', investments: [{ dividend: 1 }] }] },
        { _id: '1', portfolio: [ { category: 'Coding', investments: [{ dividend: 3 }] }] },
        { _id: '3', portfolio: [ { category: 'Coding', investments: [{ dividend: 3 }] }] },
        { _id: '2', portfolio: [ { category: 'Coding', investments: [{ dividend: 5 }] }] },
      ];

      var dividendsComparator = utils.getDividendsComparator('Coding');
      var results = users.sort(dividendsComparator);
      expect(results.length).toEqual(4);
      expect(results).toEqual(expected);
    });
  });

  describe('percentileComparator: ', function() {
    it('should correctly sort users by expert percentile in decreasing order if expert', function() {
      var users = [
        { _id: '1', categories: [{ name: 'Coding', percentile: 3 }] },
        { _id: '2', categories: [{ name: 'Coding', percentile: 5 }] },
        { _id: '3', categories: [{ name: 'Coding', percentile: 3 }] },
        { _id: '4', categories: [{ name: 'Coding', percentile: 1 }] },
      ];

      var expected = [
        { _id: '2', categories: [{ name: 'Coding', percentile: 5 }] },
        { _id: '1', categories: [{ name: 'Coding', percentile: 3 }] },
        { _id: '3', categories: [{ name: 'Coding', percentile: 3 }] },
        { _id: '4', categories: [{ name: 'Coding', percentile: 1 }] },
      ];

      var percentileComparator = utils.getPercentileComparator('Coding', true);
      var results = users.sort(percentileComparator);
      expect(results.length).toEqual(4);
      expect(results).toEqual(expected);
    });

    it('should correctly sort users by investor percentile in decreasing order if not expert', function() {
      var users = [
        { _id: '1', portfolio: [{ category: 'Coding', percentile: 3 }] },
        { _id: '2', portfolio: [{ category: 'Coding', percentile: 5 }] },
        { _id: '3', portfolio: [{ category: 'Coding', percentile: 3 }] },
        { _id: '4', portfolio: [{ category: 'Coding', percentile: 1 }] },
      ];

      var expected = [
        { _id: '2', portfolio: [{ category: 'Coding', percentile: 5 }] },
        { _id: '1', portfolio: [{ category: 'Coding', percentile: 3 }] },
        { _id: '3', portfolio: [{ category: 'Coding', percentile: 3 }] },
        { _id: '4', portfolio: [{ category: 'Coding', percentile: 1 }] },
      ];

      var percentileComparator = utils.getPercentileComparator('Coding', false);
      var results = users.sort(percentileComparator);
      expect(results.length).toEqual(4);
      expect(results).toEqual(expected);
    });
  });

  describe('repsComparator: ', function() {
    it('should correctly sort users by reps in increasing order', function() {
      var users = [
        { _id: '1', categories: [{ name: 'Coding', reps: 3 }] },
        { _id: '2', categories: [{ name: 'Coding', reps: 5 }] },
        { _id: '3', categories: [{ name: 'Coding', reps: 3 }] },
        { _id: '4', categories: [{ name: 'Coding', reps: 1 }] },
      ];

      var expected = [
        { _id: '4', categories: [{ name: 'Coding', reps: 1 }] },
        { _id: '1', categories: [{ name: 'Coding', reps: 3 }] },
        { _id: '3', categories: [{ name: 'Coding', reps: 3 }] },
        { _id: '2', categories: [{ name: 'Coding', reps: 5 }] },
      ];

      var repsComparator = utils.getRepsComparator('Coding');
      var results = users.sort(repsComparator);
      expect(results.length).toEqual(4);
      expect(results).toEqual(expected);
    });
  });

  describe('updateInvestorPercentiles: ', function() {
    var investors, category, cb;
    beforeEach(function() {
      cb = jasmine.createSpy();
    });

    it('should give all investors a percentile of 50 if dividends are the same', function() {
      category = 'Coding';
      investors = [
        { _id: '1', portfolio: [ { category: category, investments: [{ dividend: 1 }] }] },
        { _id: '2', portfolio: [ { category: category, investments: [{ dividend: 1 }] }] },
      ];

      utils.updateInvestorPercentiles(investors, category, cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
      expect(investors[0].portfolio[0].percentile).toEqual(50);
      expect(investors[1].portfolio[0].percentile).toEqual(50);
    });

    it('should give all investors correct percentiles if dividends are different', function() {
      category = 'Coding';
      investors = [
        { _id: '1', portfolio: [ { category: category, investments: [{ dividend: 1 }] }] },
        { _id: '2', portfolio: [ { category: category, investments: [{ dividend: 2 }] }] },
        { _id: '3', portfolio: [ { category: category, investments: [{ dividend: 3 }] }] },
        { _id: '4', portfolio: [ { category: category, investments: [{ dividend: 4 }] }] },
      ];

      utils.updateInvestorPercentiles(investors, category, cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
      expect(investors[0].portfolio[0].percentile).toEqual(12);
      expect(investors[1].portfolio[0].percentile).toEqual(37);
      expect(investors[2].portfolio[0].percentile).toEqual(62);
      expect(investors[3].portfolio[0].percentile).toEqual(87);
    });

    it('should give a single investor a percentile of 50', function() {
      category = 'Coding';
       var investments = [ { amount: 10 } ];

      investors = [
        { _id: '1', portfolio: [ { category: category, investments: [] }] },
      ];

      utils.updateInvestorPercentiles(investors, category, cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
      expect(investors[0].portfolio[0].percentile).toEqual(50);
    });

    it('should return an error if the first investor does not have the category', function() {
      category = 'Coding';
      investors = [
        { _id: '1', portfolio: [ { category: 'A', investments: [] }], username: 'Matt Ritter' },
      ];
      utils.updateInvestorPercentiles(investors, category, cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith('Could not find portfolio index for user Matt Ritter');
    });

    it('should return an error if any investor does not have the category', function() {
      category = 'Coding';
      investors = [
        { _id: '1', username: 'Matt Ritter', portfolio: [ { category: category, investments: [] }], },
        { _id: '2', username: 'Bob', portfolio: [ { category: 'A', investments: [] }] },
      ];

      utils.updateInvestorPercentiles(investors, category, cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith('Could not find portfolio index for user Bob');
    });
  });

  describe('getExpertPercentiles: ', function() {
    var experts, category, cb;

    beforeEach(function() {
      cb = jasmine.createSpy();
    });

    it('should give all experts a percentile of 50 if reps are the same', function() {
      category = 'Coding';
      experts = [
        { _id: '1', categories: [ { name: category, reps: 10 }] },
        { _id: '2', categories: [ { name: category, reps: 10 }] },
      ];
      utils.getExpertPercentiles(experts, category, cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
      expect(experts[0].categories[0].percentile).toEqual(50);
      expect(experts[1].categories[0].percentile).toEqual(50);
    });

    it('should give all experts correct percentiles if reps are different', function() {
      category = 'Coding';
      experts = [
        { _id: '1', categories: [ { name: category, reps: 10 }] },
        { _id: '2', categories: [ { name: category, reps: 12 }] },
        { _id: '3', categories: [ { name: category, reps: 14 }] },
        { _id: '4', categories: [ { name: category, reps: 16 }] },
      ];
      utils.getExpertPercentiles(experts, category, cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
      expect(experts[0].categories[0].percentile).toEqual(12);
      expect(experts[1].categories[0].percentile).toEqual(37);
      expect(experts[2].categories[0].percentile).toEqual(62);
      expect(experts[3].categories[0].percentile).toEqual(87);
    });

    it('should give a single expert a percentile of 50', function() {
      category = 'Coding';
      experts = [
        { _id: '1', categories: [ { name: category, reps: 10 }] },
      ];
      utils.getExpertPercentiles(experts, category, cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
      expect(experts[0].categories[0].percentile).toEqual(50);
    });

    it('should return an error if the first expert does not have the category', function() {
      category = 'Coding';
      experts = [
        { _id: '1', username: 'Matt Ritter', categories: [] },
      ];
      utils.getExpertPercentiles(experts, category, cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith('Could not find category index for user Matt Ritter');
    });

    it('should return an error if any expert does not have the category', function() {
      category = 'Coding';
      experts = [
        { _id: '1', username: 'Matt Ritter', categories: [{ name: category, reps: 10 }] },
        { _id: '2', username: 'Bob', categories: [] },
      ];
      utils.getExpertPercentiles(experts, category, cb);
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith('Could not find category index for user Bob');
    });
  });

  describe('removeInvestorFromExpertOnRevoke', function() {
    var expert = { _id: '123' };
    var investorId = '456'
    beforeEach(function() {
      spyOn(utils, 'removeInvestor').andReturn();
    });

    it('returns does not change the expert if the investor still has investments', function() {
      var portfolioEntry = { investments: [ { userId: '123' } ] };
      utils.removeInvestorFromExpertOnRevoke(expert, investorId, portfolioEntry);
      expect(utils.removeInvestor.callCount).toEqual(0);
    });

    it('call to remove investor', function() {
      var portfolioEntry = { investments: [] };
      utils.removeInvestorFromExpertOnRevoke(expert, investorId, portfolioEntry);
      expect(utils.removeInvestor.callCount).toEqual(1);
    });
  });

  describe('processTransaction', function() {
    var fromUser, toUser, category, transaction, investmentId;
    beforeEach(function() {
      transaction = { amount: 10.565 };
      category = { name: 'Coding', reps: 10.123 };
    });

    it('handles error updating toUser', function() {
      spyOn(utils, 'updateTransactionToUser').andReturn(null);
      var err = utils.processTransaction(toUser, fromUser, category, transaction, investmentId);
      expect(err).toEqual('User is not an expert for category');
    });

    it('handles error updating fromUser', function() {
      spyOn(utils, 'updateTransactionToUser').andReturn(12);
      spyOn(utils, 'updateTransactionFromUser').andReturn('Error');
      var err = utils.processTransaction(toUser, fromUser, category, transaction, investmentId);
      expect(err).toEqual('Error');
    });

    it('rounds amount to nearest hundredth and updates category reps', function() {
      spyOn(utils, 'updateTransactionToUser').andReturn(12);
      spyOn(utils, 'updateTransactionFromUser').andReturn(null);
      var err = utils.processTransaction(toUser, fromUser, category, transaction, investmentId);
      expect(err).toEqual(null);
      expect(category.reps).toEqual(20.69);
    });
  });

  describe('updateTransactionToUser', function() {
    var expert, investor, amount, category;
    beforeEach(function() {
      amount = 10;
      category = 'Coding';
    });

    it('should return null if the expert is not an investor for the category', function() {
      expert = { categories: [] };
      var result = utils.updateTransactionToUser(expert, investor, category, amount);
      expect(result).toEqual(null);
    });

    it('should add the investor to the expert category and increment expert reps', function() {
      expert = { categories: [ { investors: [], reps: 5, name: 'Coding' }]  };
      investor = { _id: '123', username: 'Matt' };
      var result = utils.updateTransactionToUser(expert, investor, category, amount);
      var expectedExpert = { categories: [ { reps: 15, name: 'Coding', investors: [ { name: 'Matt', id: '123' } ] } ] };
      expect(result).toEqual(15);
      expect(expert).toEqual(expectedExpert);
    });
  });

  describe('getTransactionPortfolioIndex', function() {
    var fromUser, category, toUser, amount, toUserReps, callback;

    beforeEach(function() {
      toUser = { _id: '123' };
      callback = jasmine.createSpy().andReturn();
    });

    it('should execute callback with portfolio index if found', function() {
      fromUser = { portfolio: [{ category: 'Coding', investments: [] }] };
      category = { name: 'Coding', investors: 0 };
      amount = 1;
      toUserReps = 10;
      var err = utils.getTransactionPortfolioIndex(amount, fromUser, toUser, toUserReps, null, category, callback);
      expect(callback).toHaveBeenCalledWith(0, amount, fromUser, toUser, toUserReps, category, null);
      expect(callback.callCount).toEqual(1);
    });

    it('should execute callback after adding portfolio index if not found', function() {
      var updatedFromUser = { portfolio: [{ category: 'Coding', investments: [] }, { category: 'Ballet', investments: [] }] }
      spyOn(User, 'findOneAndUpdate').andCallFake(function(arg1, arg2, cb) {
        return cb(null, updatedFromUser);
      });
      fromUser = { portfolio: [{ category: 'Coding', investments: [] }] };
      category = { name: 'Ballet', investors: 0 };
      amount = 1;
      toUserReps = 10;
      var err = utils.getTransactionPortfolioIndex(amount, fromUser, toUser, toUserReps, null, category, callback);
      expect(callback).toHaveBeenCalledWith(1, amount, updatedFromUser, toUser, toUserReps, category, null);
      expect(callback.callCount).toEqual(1);
    });

    it('should handle error updating the user', function() {
      var updatedFromUser = { portfolio: [{ category: 'Coding', investments: [] }, { category: 'Ballet', investments: [] }] }
      spyOn(User, 'findOneAndUpdate').andCallFake(function(arg1, arg2, cb) {
        return cb('Error', null);
      });
      fromUser = { portfolio: [{ category: 'Coding', investments: [] }] };
      category = { name: 'Ballet', investors: 0 };
      amount = 1;
      toUserReps = 10;
      var err = utils.getTransactionPortfolioIndex(amount, fromUser, toUser, toUserReps, null, category, callback);
      expect(err).toEqual('Error');
      expect(callback.callCount).toEqual(0);
    });
  });

  describe('
//   describe('updateTransactionFromUser', function() {
//     var fromUser, category, toUser, amount, toUserReps;
// 
//     it('should return null if revoking from a non-existent investment', function() {
//       console.log('should return null');
//       fromUser = { portfolio: [{ category: 'Coding', investments: [] }] };
//       category = 'Coding';
//       amount = -1;
//       var err = utils.updateTransactionFromUser(fromUser, toUser, category, amount, toUserReps);
//       expect(err).toEqual('Investment for revoke was not found');
//     });
// 
//     it('should add user to the portfolio if investment is a give', function() {
//       fromUser = { reps: 100, portfolio: [{ category: 'Coding', investments: [] }] };
//       amount = 10;
//       toUserReps = 20;
//       toUser = { _id: '123', username: 'Matt' };
// 
//       var err = utils.updateTransactionFromUser(fromUser, toUser, category, amount, toUserReps);
//       var newInvestment = { user: 'Matt', userId: '123', amount: 10, percentage: 0.50, dividend: 1 };
//       expect(fromUser.portfolio[0].investments).toEqual([newInvestment]);
//       expect(fromUser.reps).toEqual(90);
//       expect(err).toEqual(null);
//     });
// 
//     it('should update the existing investment and dividend if revoke', function() {
//       var existingInvestment = { _id: '1', user: 'Matt', userId: '123', amount: 10, percentage: 0.1, dividend: 10 };
//       var fromUser = { reps: 100, portfolio: [{ category: 'Coding', investments: [existingInvestment] }] };
//       amount = -2;
//       toUserReps = 998;
//       toUser = { id: '123', name: 'Matt' };
//       var id = '1';
//       var err = utils.updateTransactionFromUser(fromUser, toUser, category, amount, toUserReps, id);
// 
//       expect(fromUser.portfolio[0].investments.length).toEqual(1);
//       expect(fromUser.portfolio[0].investments[0].amount).toEqual(8);
//       expect(fromUser.portfolio[0].investments[0].percentage).toEqual(0.08);
//       expect(fromUser.portfolio[0].investments[0].dividend).toEqual(7.98);
//       expect(fromUser.reps).toEqual(102);
//       expect(err).toEqual(null);
//     });
// 
//     it('should remove the investment if it is entirely revoked', function() {
//       var investment = { _id: '1', user: "Matt", userId: "123", amount: 10, dividend: 1, percentage: 10 };
//       var investment2 = { _id: '2', user: "Bob", userId: "456", amount: 10, dividend: 1, percentage: 10 };
//       var investment3 = { _id: '3', user: "Matt", userId: "123", amount: 10, dividend: 1, percentage: 10 };
//       var fromUser = { reps: 100, portfolio: [{ category: "Coding", roi: { value: 0, length: 0 }, investments: [investment, investment2, investment3] }] };
//       amount = -10;
//       toUserReps = 990;
//       toUser = { id: '123', name: 'Matt' };
//       var id = '1';
//       spyOn(utils, 'removeInvestorFromExpertOnRevoke').andReturn();
// 
//       var err = utils.updateTransactionFromUser(fromUser, toUser, category, amount, toUserReps, id);
//       expect(fromUser.portfolio[0].investments.length).toEqual(2);
//       expect(fromUser.portfolio[0].investments[0]._id).toEqual('2');
//       expect(fromUser.reps).toEqual(110);
//       expect(err).toEqual(null);
//     });
//   });

  describe('addInvestorToExpertCategory', function() {
    var investor = { username: 'Bob', _id: '123' };
    var i, categories, expert, investors;

    it('should return the expert unchanged if the investor was present', function() {
      investors = [{ name: 'Bob', id: '123' }];
      categories = [{ name: 'Coding', investors: investors }];
      expert = { categories: categories };
      i = 0;
      var e = utils.addInvestorToExpertCategory(expert, investor, i);
      expect(e.categories[i].investors).toEqual(investors);
    });

    it('should add the investor to the category if the investor was not present', function() {
      categories = [{ name: 'Coding', investors: [] }];
      expert = { categories: categories };
      i = 0;
      var e = utils.addInvestorToExpertCategory(expert, investor, i);
      expect(e.categories[i].investors).toEqual([{ name: 'Bob', id: '123' }]);
    });
  });

  describe('getCategoryIndex: ', function() {
    var categories = [
      { name: 'Ballet' },
      { name: 'Coding' },
    ];

    var expert = { categories: categories };
    it('should return the index of the category if present', function() {
      var i = utils.getCategoryIndex(expert, 'Coding');
      expect(i).toEqual(1);
    });

    it('should return -1 when the category is not present', function() {
      var i = utils.getCategoryIndex(expert, 'Foo');
      expect(i).toEqual(-1);
    });

    it('should return -1 if the expert has no categories', function() {
      var emptyExpert = { categories: [] };
      var i = utils.getCategoryIndex(emptyExpert, 'Coding');
      expect(i).toEqual(-1);
    });
  });

  describe('getPortfolioIndex: ', function() {
    var portfolio = [
      { category: 'Ballet' },
      { category: 'Coding' },
    ];

    var investor = { portfolio: portfolio };
    it('should return the index of the category if present', function() {
      var i = utils.getPortfolioIndex(investor, 'Coding');
      expect(i).toEqual(1);
    });

    it('should return -1 when the category is not present', function() {
      var i = utils.getPortfolioIndex(investor, 'Foo');
      expect(i).toEqual(-1);
    });

    it('should return -1 if the investor has no categories', function() {
      var emptyInvestor = { portfolio: [] };
      var i = utils.getPortfolioIndex(emptyInvestor, 'Coding');
      expect(i).toEqual(-1);
    });
  });

  describe('updateDividends', function() {
    it('should correctly update dividends', function() {
      var category = 'Coding';
      var expertReps = 100;
      var username = 'Matt';

      var investment1 = { user: 'Matt', userId: '123', amount: 8, percentage: 0.20, dividend: 1 };
      var investment2 = { user: 'Matt', userId: '123', amount: 5, percentage: 0.15, dividend: 1 };
      var investment3 = { user: 'Matt', userId: '123', amount: 20, percentage: 0.10, dividend: 1 };
      var investment4 = { user: 'Bob', userId: '456', amount: 10, percentage: 0.14, dividend: 1 };

      var investors = [
        { _id: '1', portfolio: [ { category: category, investments: [investment1] }] },
        { _id: '2', portfolio: [ { category: category, investments: [investment2] }] },
        { _id: '3', portfolio: [ { category: category, investments: [investment3] }] },
        { _id: '4', portfolio: [ { category: category, investments: [investment4] }] },
      ];

      var result1 = { user: 'Matt', userId: '123', amount: 8, percentage: 0.20, dividend: 2 };
      var result2 = { user: 'Matt', userId: '123', amount: 5, percentage: 0.15, dividend: 1.5 };
      var result3 = { user: 'Matt', userId: '123', amount: 20, percentage: 0.10, dividend: 1 };
      var result4 = { user: 'Bob', userId: '456', amount: 10, percentage: 0.14, dividend: 1 };

      var expectedInvestors = [
        { _id: '1', portfolio: [ { category: category, investments: [result1] }] },
        { _id: '2', portfolio: [ { category: category, investments: [result2] }] },
        { _id: '3', portfolio: [ { category: category, investments: [result3] }] },
        { _id: '4', portfolio: [ { category: category, investments: [result4] }] },
      ];

      var results = utils.updateDividends(investors, category, username, expertReps);
      for (var i = 0; i < results.length; i++) {
        expect(results[i]).toEqual(expectedInvestors[i]);
      }
    });
  });

  describe('saveAll: ', function() {
    beforeEach(function() {
      jasmine.Clock.useMock();
      saveLogic = jasmine.createSpy();
      mainCB = jasmine.createSpy();
    });

    it('should simply return if there are 0 docs passed in', function() {
      var docs = [];
      utils.saveAll(docs, mainCB);
      expect(mainCB.callCount).toEqual(1);
      expect(mainCB).toHaveBeenCalledWith([]);
    });

    it('should not call the callback until the docs have been saved', function() {
      var mockSave = function(cb) {
        setTimeout(function() {
          saveLogic();
          cb();
        }, 100);
      };

      docs = [
        {save: mockSave},
        {save: mockSave},
      ];

      utils.saveAll(docs, mainCB);

      expect(saveLogic.callCount).toEqual(0);
      expect(mainCB.callCount).toEqual(0);

      jasmine.Clock.tick(101);

      expect(saveLogic.callCount).toEqual(2);
      expect(mainCB.callCount).toEqual(1);
      expect(mainCB).toHaveBeenCalledWith([]);
    });

    it('should accumulate errors and pass them to the callback', function() {
      var i = 0;
      var errors = ['1', '2'];
      var mockSave = function(cb) {
        setTimeout(function() {
          saveLogic();
          cb(errors[i]);
          i++;
        }, 100);
      };

      docs = [
        {save: mockSave},
        {save: mockSave},
      ];

      utils.saveAll(docs, mainCB);
      jasmine.Clock.tick(101);

      expect(mainCB).toHaveBeenCalledWith(['1', '2']);
    });
  });

  describe('getRandomString', function() {
    it('should get a verification token with length 24', function() {
      expect(utils.getRandomString().length).toEqual(24);
    });

    it ('should get unique tokens', function() {
      expect(utils.getRandomString()).not.toEqual(utils.getRandomString());
    });
  });

  describe('getVerificationEmailOptions', function() {
    it('should add the url to the text', function() {
      expect(utils.getVerificationEmailOptions('test@test.com', 'test')).toEqual({
        from: jasmine.any(String),
        to: 'test@test.com',
        subject: jasmine.any(String),
        text:
          'Hi!\n\n Please confirm your new account for Repcoin by clicking ' +
          'this URL: ' + urlConfig[process.env.NODE_ENV] + '#/verify/test/' +
          ' \n\n\n Thanks,\nThe Repcoin Team',

      });
    });
  });

  describe('createEvent', function() {
    beforeEach(function() {
      spyOn(utils, 'createJoinEvent').andCallFake(function(name, id) {
        return [name, id];
      });
    });

    it('should call create join event', function() {
      utils.createEvent('join', ['foo', 'bar']);
      expect(utils.createJoinEvent).toHaveBeenCalledWith('foo', 'bar');
    });
  });
});
