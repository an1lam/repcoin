process.env.NODE_ENV = 'test';
var UserSnapshotHandler = require('../api/handlers/usersnapshot.js');

var Transaction = require('../api/models/Transaction.js');
var UserSnapshot = require('../api/models/UserSnapshot.js');
var Q = require('q');

var winston = require('winston');
var utils = require('../api/routes/utils.js');

describe('UserSnapshotHandler: ', function() {
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

  describe('userId: ', function() {
    describe('category: ', function() {
      describe('expert: ', function() {
        beforeEach(function() {
          req.params = { userId: '123', category: 'Coding' };
        });

        describe('reps: ', function() {
          afterEach(function() {
            expect(res.status.callCount).toEqual(1);
            expect(res.send.callCount).toEqual(1);
          });

          it('handles error finding reps', function() {
            spyOn(UserSnapshot, 'getExpertReps').andReturn({
              then: function(cbS, cbF) { return cbF('failure'); }
            });
            UserSnapshotHandler.userId.category.expert.reps.get(req, res);
            expect(res.status).toHaveBeenCalledWith(503);
            expect(res.send).toHaveBeenCalledWith('failure');
          });

          it('returns total reps', function() {
            var repsPromise = {
              results: [
                { timeStamp: '1991', reps: 3 },
                { timeStamp: '1992', reps: 6 },
              ],

              then: function(cb) {
                return cb(this.results);
              }
            };

            var expectedReps = [
              [ 'Date', 'Reps' ],
              [ '12/31', 3],
              [ '12/31', 6]
            ]
            spyOn(UserSnapshot, 'getExpertReps').andReturn(repsPromise);
            UserSnapshotHandler.userId.category.expert.reps.get(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expectedReps);
          });
        });

        describe('volume: ', function() {
          var snapshotPromise, errorPromise;
          beforeEach(function() {
            snapshotPromise = {
              results: [
                { timeStamp: '1991' },
                { timeStamp: '1992' },
              ],

              sort: function() {
                return this;
              },

              exec: function() {
                return this;
              },

              then: function(cb) {
                return cb(this.results);
              }
            };

            volumePromise = {
              result: [{ volume: 1 }],

              then: function(cb) {
                return cb(this.result);
              }
            };
          });

          it('returns the volume: ', function() {
            spyOn(UserSnapshot, 'find').andReturn(snapshotPromise);
            spyOn(Transaction, 'findVolume').andReturn(volumePromise);
            Q.when(UserSnapshotHandler.userId.category.expert.volume.get(req, res), function() {
              expect(res.status).toHaveBeenCalledWith(200);
              expect(res.send).toHaveBeenCalledWith([['Date', 'Volume'], ['12/31', 1], ['12/31', 1]]);
              expect(res.send.callCount).toEqual(1);
              expect(res.status.callCount).toEqual(1);
            });
          });
        });

        describe('ranks: ', function() {
          afterEach(function() {
            expect(res.status.callCount).toEqual(1);
            expect(res.send.callCount).toEqual(1);
          });

          it('handles error finding ranks', function() {
            spyOn(UserSnapshot, 'getExpertRanks').andReturn({
              then: function(cbS, cbF) { return cbF('failure'); }
            });
            UserSnapshotHandler.userId.category.expert.ranks.get(req, res);
            expect(res.status).toHaveBeenCalledWith(503);
            expect(res.send).toHaveBeenCalledWith('failure');
          });

          it('returns total ranks', function() {
            var rankPromise = {
              results: [
                { timeStamp: '1991', rank: 3 },
                { timeStamp: '1992', rank: 6 },
              ],

              then: function(cb) {
                return cb(this.results);
              }
            };

            var expectedRanks = [
              [ 'Date', 'Rank' ],
              [ '12/31', 3],
              [ '12/31', 6]
            ]
            spyOn(UserSnapshot, 'getExpertRanks').andReturn(rankPromise);
            UserSnapshotHandler.userId.category.expert.ranks.get(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expectedRanks);
          });
        });
      });

      describe('investor: ', function() {
        beforeEach(function() {
          req.params = { userId: '123', category: 'Coding' };
        });

        afterEach(function() {
          expect(res.status.callCount).toEqual(1);
          expect(res.send.callCount).toEqual(1);
        });

        describe('ranks: ', function() {
          it('handles error finding ranks', function() {
            spyOn(UserSnapshot, 'getInvestorRanks').andReturn({
              then: function(cbS, cbF) { return cbF('failure'); }
            });
            UserSnapshotHandler.userId.category.investor.ranks.get(req, res);
            expect(res.status).toHaveBeenCalledWith(503);
            expect(res.send).toHaveBeenCalledWith('failure');
          });

          it('returns total ranks', function() {
            var rankPromise = {
              results: [
                { timeStamp: '1991', rank: 3 },
                { timeStamp: '1992', rank: 6 },
              ],

              then: function(cb) {
                return cb(this.results);
              }
            };

            var expectedRanks = [
              [ 'Date', 'Rank' ],
              [ '12/31', 3],
              [ '12/31', 6]
            ]
            spyOn(UserSnapshot, 'getInvestorRanks').andReturn(rankPromise);
            UserSnapshotHandler.userId.category.investor.ranks.get(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expectedRanks);
          });
        });

        describe('dividends: ', function() {
          it('handles error finding dividends', function() {
            spyOn(UserSnapshot, 'getTotalDividends').andReturn({
              then: function(cbS, cbF) { return cbF('failure'); }
            });
            UserSnapshotHandler.userId.category.investor.dividends.get(req, res);
            expect(res.status).toHaveBeenCalledWith(503);
            expect(res.send).toHaveBeenCalledWith('failure');
          });

          it('returns total dividends', function() {
            var dividendPromise = {
              results: [
                { _id: '1991', total: 3 },
                { _id: '1992', total: 6 },
              ],

              then: function(cb) {
                return cb(this.results);
              }
            };

            var expectedDividends = [
              [ 'Date', 'Total Dividends' ],
              [ '12/31', 3],
              [ '12/31', 6]
            ]
            spyOn(UserSnapshot, 'getTotalDividends').andReturn(dividendPromise);
            UserSnapshotHandler.userId.category.investor.dividends.get(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expectedDividends);
          });
        });

        describe('percentreturns: ', function() {
          it('handles error finding percent returns', function() {
            spyOn(UserSnapshot, 'getPercentReturns').andReturn({
              then: function(cbS, cbF) { return cbF('failure'); }
            });
            UserSnapshotHandler.userId.category.investor.percentreturns.get(req, res);
            expect(res.status).toHaveBeenCalledWith(503);
            expect(res.send).toHaveBeenCalledWith('failure');
          });

          it('returns percent returns', function() {
            var percentReturnPromise = {
              results: [
                { _id: '1991', ret: 0.3 },
                { _id: '1992', ret: 0.4 },
              ],

              then: function(cb) {
                return cb(this.results);
              }
            };

            var expectedReturns = [
              [ 'Date', 'Percent Returns' ],
              [ '12/31', 30],
              [ '12/31', 40]
            ]
            spyOn(UserSnapshot, 'getPercentReturns').andReturn(percentReturnPromise);
            UserSnapshotHandler.userId.category.investor.percentreturns.get(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expectedReturns);
          });
        });
      });
    });
  });
});
