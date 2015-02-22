process.env.NODE_ENV = 'test';
var winston = require('winston');

var AddExpertEvent = require('../api/models/AddExpertEvent.js');
var ComboHandler = require('../api/handlers/combo.js');
var JoinEvent = require('../api/models/JoinEvent.js');
var NewCategoryEvent = require('../api/models/NewCategoryEvent.js');
var NewGhostEvent = require('../api/models/NewGhostEvent.js');
var Transaction = require('../api/models/Transaction.js');

describe('ComboHandler: ', function() {
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

  describe('feedItems: ', function() {
    beforeEach(function() {
      transactionPromise = {
        t1: {
          timeStamp: new Date('1992')
        },

        t2: {
          timeStamp: new Date('1994')
        },

        then: function(cb) {
          return cb([this.t1, this.t2]);
        }
      };

      joinEventPromise = {
        e1: {
          timeStamp: new Date('1993')
        },

        then: function(cb) {
          return cb([this.e1]);
        }
      };

      newCategoryEventPromise = {
        e1: {
          timeStamp: new Date('1995')
        },

        then: function(cb) {
          return cb([this.e1]);
        }
      };

      newGhostEventPromise = {
        e1: {
          timeStamp: new Date('1989')
        },

        then: function(cb) {
          return cb([this.e1]);
        }
      };

      addExpertEventPromise = {
        e1: {
          timeStamp: new Date('1996')
        },

        then: function(cb) {
          return cb([this.e1]);
        }
      };
    });

    describe('get: ', function() {
      it('should sort the items in order of timestamp', function() {
        req.params = { timeStamp: new Date() };
        spyOn(Transaction, 'findMostRecent').andReturn(transactionPromise);
        spyOn(JoinEvent, 'findMostRecent').andReturn(joinEventPromise);
        spyOn(NewCategoryEvent, 'findMostRecent').andReturn(newCategoryEventPromise);
        spyOn(NewGhostEvent, 'findMostRecent').andReturn(newGhostEventPromise);
        spyOn(AddExpertEvent, 'findMostRecent').andReturn(addExpertEventPromise);
        ComboHandler.feedItems.get(req, res);
        expect(res.send).toHaveBeenCalledWith([
          { timeStamp: new Date('1996') },
          { timeStamp: new Date('1995') },
          { timeStamp: new Date('1994') },
          { timeStamp: new Date('1993') },
          { timeStamp: new Date('1992') },
          { timeStamp: new Date('1989') },
        ]);
      });

      it('should log an error when the transaction findMostRecent fails', function() {
        req.params = { timeStamp: new Date() };
        spyOn(Transaction, 'findMostRecent').andReturn({
          then: function(cbS, cbF) { return cbF('failure!'); }
        });
        ComboHandler.feedItems.get(req, res);

        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.send).toHaveBeenCalledWith('failure!');
      });

      it('should log an error when the join event findMostRecent fails', function() {
        req.params = { timeStamp: new Date() };
        spyOn(Transaction, 'findMostRecent').andReturn(transactionPromise);
        spyOn(JoinEvent, 'findMostRecent').andReturn({
          then: function(cbS, cbF) { return cbF('failure!'); }
        });
        ComboHandler.feedItems.get(req, res);

        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.send).toHaveBeenCalledWith('failure!');
      });

      it('should log an error when the newcategory event findMostRecent fails', function() {
        req.params = { timeStamp: new Date() };
        spyOn(Transaction, 'findMostRecent').andReturn(transactionPromise);
        spyOn(JoinEvent, 'findMostRecent').andReturn({
          then: function(cbS, cbF) { return cbS(joinEventPromise); }
        });
        spyOn(NewCategoryEvent, 'findMostRecent').andReturn({
          then: function(cbS, cbF) { return cbF('failure!'); }
        });
        ComboHandler.feedItems.get(req, res);

        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.send).toHaveBeenCalledWith('failure!');
      });

      it('should log an error when the addexpert event findMostRecent fails', function() {
        req.params = { timeStamp: new Date() };
        spyOn(Transaction, 'findMostRecent').andReturn(transactionPromise);
        spyOn(JoinEvent, 'findMostRecent').andReturn({
          then: function(cbS, cbF) { return cbS(joinEventPromise); }
        });
        spyOn(NewCategoryEvent, 'findMostRecent').andReturn({
          then: function(cbS, cbF) { return cbS(newCategoryEventPromise); }
        });

        spyOn(AddExpertEvent, 'findMostRecent').andReturn({
          then: function(cbS, cbF) { return cbF('failure!'); }
        });
        ComboHandler.feedItems.get(req, res);

        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.send).toHaveBeenCalledWith('failure!');
      });
    });
  });
});
