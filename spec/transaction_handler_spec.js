process.env.NODE_ENV = 'test';
var Category = require('../api/models/Category.js');
var Transaction = require('../api/models/Transaction.js');
var TransactionHandler = require('../api/handlers/transaction.js');
var User = require('../api/models/User.js');
var utils = require('../api/routes/utils.js');
var winston = require('winston');

describe('TransactionHandler: ', function() {
  var req, res;
  beforeEach(function() {
    spyOn(winston, 'log').andCallFake(function(arg1, arg2, arg3, arg4) {
      return;
    });

    req = {
      query: {},
      params: {},
      body: {},
      session: {}
    };

    res = {
      status: jasmine.createSpy().andCallFake(function(msg) {
        return this;
      }),
      send: jasmine.createSpy().andCallFake(function(msg) {
        return this;
      }),
      login: jasmine.createSpy().andCallFake(function(user) {
        return user;
      }),
      end: jasmine.createSpy()
    };
  });

  afterEach(function() {
    expect(res.status.callCount).toEqual(1);
    expect(res.send.callCount).toEqual(1);
  });

  describe('transactions: ', function() {
    describe('category', function() {
      describe('getMostRecent', function() {
        beforeEach(function() {
          req.params = { category: 'Coding', timeStamp: new Date() };
        });
        it('handles error fetching transactions', function() {
          spyOn(Transaction, 'findMostRecentByCategory').andReturn({
            then: function(cbS, cbF) { return cbF('Error'); }
          });
          TransactionHandler.transactions.category.findMostRecent(req, res);
          expect(res.status).toHaveBeenCalledWith(503);
          expect(res.send).toHaveBeenCalledWith('Error');
        });

        it('returns the most recent transactions by category', function() {
          var transactions = [ { amount: 10 }, { amount: -2 } ];
          var transactionPromise = {
            transactions: transactions,
            then: function(cb) {
              return cb(this.transactions);
            }
          };
          spyOn(Transaction, 'findMostRecentByCategory').andReturn(transactionPromise);
          TransactionHandler.transactions.category.findMostRecent(req, res);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith(transactions);
        });
      });
    });

    describe('userId', function() {
      describe('getMostRecent', function() {
        it('handles error fetching transactions', function() {
          req.params = { user_id: '123', filter: 'all', timeStamp: new Date() };
          spyOn(Transaction, 'findMostRecentAllUser').andReturn({
            then: function(cbS, cbF) { return cbF('Error'); }
          });
          TransactionHandler.transactions.userId.findMostRecent(req, res);
          expect(res.status).toHaveBeenCalledWith(503);
          expect(res.send).toHaveBeenCalledWith('Error');
          expect(Transaction.findMostRecentAllUser.callCount).toEqual(1);
        });

        it('returns all most recent transactions by userId', function() {
          req.params = { user_id: '123', filter: 'all', timeStamp: new Date() };
          var transactions = [ { amount: 10 }, { amount: -2 } ];
          var transactionPromise = {
            transactions: transactions,
            then: function(cb) {
              return cb(this.transactions);
            }
          };
          spyOn(Transaction, 'findMostRecentAllUser').andReturn(transactionPromise);
          TransactionHandler.transactions.userId.findMostRecent(req, res);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith(transactions);
          expect(Transaction.findMostRecentAllUser.callCount).toEqual(1);
        });

        it('returns most recent transactions to userId', function() {
          req.params = { user_id: '123', filter: 'to', timeStamp: new Date() };
          var transactions = [ { amount: 10 }, { amount: -2 } ];
          var transactionPromise = {
            transactions: transactions,
            then: function(cb) {
              return cb(this.transactions);
            }
          };
          spyOn(Transaction, 'findMostRecentToUser').andReturn(transactionPromise);
          TransactionHandler.transactions.userId.findMostRecent(req, res);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith(transactions);
          expect(Transaction.findMostRecentToUser.callCount).toEqual(1);
        });

        it('returns most recent transactions from userId', function() {
          req.params = { user_id: '123', filter: 'from', timeStamp: new Date() };
          var transactions = [ { amount: 10 }, { amount: -2 } ];
          var transactionPromise = {
            transactions: transactions,
            then: function(cb) {
              return cb(this.transactions);
            }
          };
          spyOn(Transaction, 'findMostRecentFromUser').andReturn(transactionPromise);
          TransactionHandler.transactions.userId.findMostRecent(req, res);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith(transactions);
          expect(Transaction.findMostRecentFromUser.callCount).toEqual(1);
        });

        it('returns most recent transactions between userIds', function() {
          req.params = { user_id: '123', filter: 'us', timeStamp: new Date() };
          req.session = { passport: { user: '456' } };
          var transactions = [ { amount: 10 }, { amount: -2 } ];
          var transactionPromise = {
            transactions: transactions,
            then: function(cb) {
              return cb(this.transactions);
            }
          };
          spyOn(Transaction, 'findMostRecentBetweenUsers').andReturn(transactionPromise);
          TransactionHandler.transactions.userId.findMostRecent(req, res);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith(transactions);
          expect(Transaction.findMostRecentBetweenUsers.callCount).toEqual(1);
        });
      });
    });

    describe('total: ', function() {
      describe('get: ', function() {

        invalidTotalPromise = {
          result: [
            { _id: '1', total: 'aa' }
          ],

          then: function(cb) {
            return cb(this.result);
          }
        };

        totalPromise = {
          result: [
            { _id: '1', total: 14.453453 }
          ],

          then: function(cb) {
            return cb(this.result);
          }
        };

        it('handles error retrieving result', function() {
          spyOn(Transaction, 'getTotalRepsTraded').andReturn({
            then: function(cbS, cbF) { return cbF('Error'); }
          });
          TransactionHandler.transactions.total.get(req, res);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('Error');
        });

        it('handles invalid total', function() {
          spyOn(Transaction, 'getTotalRepsTraded').andReturn(invalidTotalPromise);
          TransactionHandler.transactions.total.get(req, res);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('Error retrieving total reps traded');
        });

        it('returns the total reps traded', function() {
          spyOn(Transaction, 'getTotalRepsTraded').andReturn(totalPromise);
          TransactionHandler.transactions.total.get(req, res);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith({ total: 14 });
        });

      });
    });

    describe('post: ', function() {
      it('handles invalid inputs', function() {
        TransactionHandler.transactions.post(req, res);
        expect(res.status).toHaveBeenCalledWith(412);
        expect(res.send).toHaveBeenCalledWith('Invalid transaction inputs');
      });
    });
  });
});
