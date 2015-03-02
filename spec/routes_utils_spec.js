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

  describe('giveInviterRepsForSharing: ', function() {
    var cb;
    beforeEach(function() {
      cb = jasmine.createSpy();
    });

    afterEach(function() {
      expect(cb.callCount).toEqual(1);
    });

    it('does nothing when hashes do not match', function() {
      var id = 'foobar';
      var hash = 'e82925af40e73dfeba187eb63de395d';
      spyOn(User, 'update').andCallFake(function(user, update, cb){
        return cb(null, 1);
      });
      utils.giveInviterRepsForSharing(id, hash, cb);
      expect(cb).toHaveBeenCalledWith('Hash ID and hash do not match');
    });

    it('updates the user, giving them 5 more reps', function() {
      var id = 'foobar';
      var hash = 'e82925af40e73dfeba187eb63d4e395d';
      spyOn(User, 'update').andCallFake(function(user, update, cb){
        return cb(null, 1);
      });
      utils.giveInviterRepsForSharing(id, hash, cb);
      expect(cb).toHaveBeenCalledWith(null);
    });

    it('fails when mongo returns an error', function() {
      var id =  'foobar';
      var hash = 'e82925af40e73dfeba187eb63d4e395d';
      spyOn(User, 'update').andCallFake(function(user, update, cb){
        return cb('error', 0);
      });
      utils.giveInviterRepsForSharing(id, hash, cb);
      expect(cb).toHaveBeenCalledWith('error');
    })
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
    var users = [{ reps: 2, portfolio: [{ category: 'Coding', investments: investments }] }];

    it('reimburses investors', function() {
      spyOn(utils, 'saveAll').andCallFake(function(users, cb) {
        return cb([]);
      });
      spyOn(User, 'find').andCallFake(function(selector, cb) {
        return cb(null, users);
      });
      var investors = [ { name: 'Foo', id: 'bar' }];

      var expectedUsers = [{ reps: 7, portfolio: [{ category: 'Coding', investments: [investments[1]] }] }];
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
      var investor = { reps: 0, portfolio: [{ category: 'Coding', investments: investments }] };
      var result = utils.reimburseInvestor(investor, 'Coding', '123');
      var expected = { reps: 5, portfolio: [{ category: 'Coding', investments: [investments[1]] }] };
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

  describe('updateRank: ', function() {
    var cb;
    beforeEach(function() {
      cb = jasmine.createSpy();
    });
    afterEach(function() {
      expect(cb.callCount).toEqual(1);
    });

    it('handles error retrieving promise', function() {
      spyOn(User, 'findRankedExperts').andReturn({
        then: function(cbS, cbF) { return cbF('Error'); }
      });
      utils.updateRank('Coding', true, cb);
      expect(cb).toHaveBeenCalledWith('Error');
    });

    it('updates expert rank if experts is true', function() {
      spyOn(User, 'findRankedExperts').andReturn({
        then: function(cbS, cbF) {
          return cbS([{ _id: '123' }, { _id: '456' }]);
        }
      });
      spyOn(User, 'findRankedInvestors').andReturn();
      spyOn(User, 'updateRank').andReturn();
      utils.updateRank('Coding', true, cb);
      expect(User.findRankedExperts.callCount).toEqual(1);
      expect(User.findRankedInvestors.callCount).toEqual(0);
      expect(User.updateRank.callCount).toEqual(2);
      expect(cb).toHaveBeenCalledWith(null);
    });

    it('updates investor rank if investors is true', function() {
      spyOn(User, 'findRankedInvestors').andReturn({
        then: function(cbS, cbF) {
          return cbS([{ _id: '123' }, { _id: '456' }]);
        }
      });
      spyOn(User, 'findRankedExperts').andReturn();
      spyOn(User, 'updateRank').andReturn();
      utils.updateRank('Coding', false, cb);
      expect(User.findRankedExperts.callCount).toEqual(0);
      expect(User.findRankedInvestors.callCount).toEqual(1);
      expect(User.updateRank.callCount).toEqual(2);
      expect(cb).toHaveBeenCalledWith(null);
    });
  });

  describe('updateDividends: ', function() {
    var cb, categoryName, expert;
    beforeEach(function() {
      cb = jasmine.createSpy();
      categoryName = 'Coding';
    });
    afterEach(function() {
      expect(cb.callCount).toEqual(1);
    });

    it('handles the expert not having the expected category', function() {
      expert = { categories: [{ name: 'Ballet' }] };
      utils.updateDividends(expert, categoryName, cb);
      expect(cb).toHaveBeenCalledWith('User is not an expert in this category');
    });

    it('handles error finding investments', function() {
      expert = { categories: [{ name: 'Coding', reps: 10 }] };
      spyOn(User, 'findInvestments').andReturn({
        then: function(cbS, cbF) { return cbF('Error'); }
      });
      utils.updateDividends(expert, categoryName, cb);
      expect(cb).toHaveBeenCalledWith('Error');
    });

    it('should correctly update dividends', function() {
      var e = { _id: '123', categories: [{ name: 'Coding', reps: 10 }] };
      var investments = [
        { _id: '1', investments:
          [
            { user: 'Matt', userId: '123', amount: 8, percentage: 0.20, dividend: 1 },
            { user: 'Bob', userId: '456', amount: 10, percentage: 0.14, dividend: 1 },
          ]
        },
      ];

      spyOn(User, 'findInvestments').andReturn({
        then: function(cbS, cbF) { return cbS(investments); }
      });
      spyOn(User, 'updateInvestments').andReturn();

      expert = { categories: [{ name: 'Coding', reps: 10 }] };
      var expectedInvestments = [
        { _id: '1', investments:
          [
            { user: 'Matt', userId: '123', amount: 8, percentage: 0.20, dividend: 0.2 },
            { user: 'Bob', userId: '456', amount: 10, percentage: 0.14, dividend: 1 },
          ]
        },
      ];

      utils.updateDividends(e, categoryName, cb);
      expect(investments).toEqual(expectedInvestments);
      expect(User.updateInvestments.callCount).toEqual(1);
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
      expect(err).toEqual('User is not an expert for category: Coding');
    });

    it('handles error updating fromUser', function() {
      spyOn(utils, 'updateTransactionToUser').andReturn(12);
      spyOn(utils, 'updateTransactionFromUser').andReturn('Error');
      var err = utils.processTransaction(toUser, fromUser, category, transaction, investmentId);
      expect(err).toEqual('Error');
    });

    it('returns with null with no errors', function() {
      spyOn(utils, 'updateTransactionToUser').andReturn(11);
      spyOn(utils, 'updateTransactionFromUser').andReturn(null);
      var err = utils.processTransaction(toUser, fromUser, category, transaction, investmentId);
      expect(err).toEqual(null);
    });

    it('handles expert reps going to 0 after revoke', function() {
      spyOn(utils, 'updateTransactionToUser').andReturn(0);
      spyOn(utils, 'updateTransactionFromUser').andReturn(null);
      var err = utils.processTransaction(toUser, fromUser, category, transaction, investmentId);
      expect(err).toEqual(null);
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
    var fromUser, category, toUser, amount, toUserReps;

    beforeEach(function() {
      toUser = { _id: '123' };
    });

    it('returns portoflio index if found', function() {
      fromUser = { portfolio: [{ category: 'Coding', investments: [] }] };
      category = { name: 'Coding', investors: 0 };
      amount = 1;
      toUserReps = 10;
      var index = utils.getTransactionPortfolioIndex(amount, fromUser, toUser, toUserReps, null, category);
      expect(index).toEqual(0);
    });

    it('adds portfolio index if not found', function() {
      var updatedFromUser = { portfolio: [{ category: 'Coding', investments: [] }, { category: 'Ballet', investments: [] }] }
      fromUser = { portfolio: [{ category: 'Coding', investments: [] }] };
      category = { name: 'Ballet', investors: 0 };
      amount = 1;
      toUserReps = 10;
      var index = utils.getTransactionPortfolioIndex(amount, fromUser, toUser, toUserReps, null, category);
      expect(index).toEqual(1);
      expect(category.investors).toEqual(1);
    });
  });

  describe('addTransactionInvesment', function() {
    var fromUser, category, toUser, amount, toUserReps;
    it('should return an error if revoking from a non-existent investment', function() {
      fromUser = { portfolio: [{ category: 'Coding', investments: [] }] };
      category = 'Coding';
      amount = -1;
      var err = utils.addTransactionInvestment(0, amount, fromUser, toUser, toUserReps, category, null, utils);
      expect(err).toEqual('Investment for revoke was not found');
   });

  it('returns an error is giving more than reps available', function() {
     fromUser = { reps: 100, portfolio: [{ category: 'Coding', investments: [] }] };
     amount = 101;
     toUserReps = 20;
     toUser = { _id: '123', username: 'Matt' };

     var err = utils.addTransactionInvestment(0, amount, fromUser, toUser, toUserReps, category, null, utils);
     expect(fromUser.portfolio[0].investments).toEqual([]);
     expect(fromUser.reps).toEqual(100);
     expect(err).toEqual('Not enough reps to give');
   });

   it('should add user to the portfolio if investment is a give', function() {
     fromUser = { reps: 100, portfolio: [{ category: 'Coding', investments: [] }] };
     amount = 10;
     toUserReps = 20;
     toUser = { _id: '123', username: 'Matt' };

     var err = utils.addTransactionInvestment(0, amount, fromUser, toUser, toUserReps, category, null, utils);
     var newInvestment = { user: 'Matt', userId: '123', amount: 10, percentage: 0.50, dividend: 1 };
     expect(fromUser.portfolio[0].investments).toEqual([newInvestment]);
     expect(fromUser.reps).toEqual(90);
     expect(err).toEqual(null);
   });

   it('returns an error if revoking more than reps in the investment', function() {
     var existingInvestment = { _id: '1', user: 'Matt', userId: '123', amount: 10, percentage: 0.1, dividend: 10 };
     var fromUser = { reps: 100, portfolio: [{ category: 'Coding', investments: [existingInvestment] }] };
     amount = -11;
     toUserReps = 998;
     toUser = { id: '123', name: 'Matt' };
     var id = '1';
     var err = utils.addTransactionInvestment(0, amount, fromUser, toUser, toUserReps, category, id, utils);

     expect(fromUser.portfolio[0].investments.length).toEqual(1);
     expect(fromUser.portfolio[0].investments[0].amount).toEqual(10);
     expect(fromUser.portfolio[0].investments[0].percentage).toEqual(0.1);
     expect(fromUser.portfolio[0].investments[0].dividend).toEqual(10);
     expect(fromUser.reps).toEqual(100);
     expect(err).toEqual('Investment only has 10 reps to revoke');
   });

   it('should update the existing investment and dividend if revoke', function() {
     var existingInvestment = { _id: '1', user: 'Matt', userId: '123', amount: 10, percentage: 0.1, dividend: 10 };
     var fromUser = { reps: 100, portfolio: [{ category: 'Coding', investments: [existingInvestment] }] };
     amount = -2;
     toUserReps = 998;
     toUser = { id: '123', name: 'Matt' };
     var id = '1';
     var err = utils.addTransactionInvestment(0, amount, fromUser, toUser, toUserReps, category, id, utils);

     expect(fromUser.portfolio[0].investments.length).toEqual(1);
     expect(fromUser.portfolio[0].investments[0].amount).toEqual(8);
     expect(fromUser.portfolio[0].investments[0].percentage).toEqual(0.08);
     expect(fromUser.portfolio[0].investments[0].dividend).toEqual(7.98);
     expect(fromUser.reps).toEqual(102);
     expect(err).toEqual(null);
   });

   it('should remove the investment if it is entirely revoked', function() {
     var investment = { _id: '1', user: 'Matt', userId: '123', amount: 10, dividend: 1, percentage: 10 };
     var investment2 = { _id: '2', user: 'Bob', userId: '456', amount: 10, dividend: 1, percentage: 10 };
     var investment3 = { _id: '3', user: 'Matt', userId: '123', amount: 10, dividend: 1, percentage: 10 };
     var fromUser = { reps: 100, portfolio: [{ category: 'Coding', roi: { value: 0, length: 0 }, investments: [investment, investment2, investment3] }] };
     amount = -10;
     toUserReps = 990;
     toUser = { id: '123', name: 'Matt' };
     var id = '1';
     spyOn(utils, 'removeInvestorFromExpertOnRevoke').andReturn();

     var err = utils.addTransactionInvestment(0, amount, fromUser, toUser, toUserReps, category, id, utils);
     expect(fromUser.portfolio[0].investments.length).toEqual(2);
     expect(fromUser.portfolio[0].investments[0]._id).toEqual('2');
     expect(fromUser.reps).toEqual(110);
     expect(err).toEqual(null);
   });

   it('should remove the category entry and decrement investors if the last investment is entirely revoked', function() {
     var investment = { _id: '1', user: 'Matt', userId: '123', amount: 10, dividend: 1, percentage: 10 };
     var fromUser = { reps: 100, portfolio: [{ category: 'Coding', roi: { value: 0, length: 0 }, investments: [ investment ] }] };
     amount = -10;
     toUserReps = 990;
     category = { name: 'Coding', investors: 5 };
     toUser = { id: '123', name: 'Matt' };
     var id = '1';
     spyOn(utils, 'removeInvestorFromExpertOnRevoke').andReturn();

     var err = utils.addTransactionInvestment(0, amount, fromUser, toUser, toUserReps, category, id, utils);
     expect(fromUser.portfolio.length).toEqual(0);
     expect(fromUser.reps).toEqual(110);
     expect(category.investors).toEqual(4);
     expect(err).toEqual(null);
   });
  });

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

    it('should immediately return if there is an error', function() {
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
