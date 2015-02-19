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
