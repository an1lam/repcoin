process.env.NODE_ENV = 'test';
var Notification = require('../api/models/Notification.js');
var NotificationHandler = require('../api/handlers/notification.js');
var winston = require('winston');
var utils = require('../api/routes/utils.js');

describe('NotificationHandler ', function() {
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

  describe('user: ', function() {
    describe('userId: ', function() {
      describe('unread: ', function() {
        it('handles error getting notifications', function() {
          req.body = { notificationIds: [] };
          spyOn(Notification, 'findUnread').andReturn({
            then: function(cbS, cbF) { return cbF('ERROR'); }
          });
          NotificationHandler.user.userId.unread.get(req, res);
          expect(res.status).toHaveBeenCalledWith(503);
          expect(res.send).toHaveBeenCalledWith('ERROR');
        });

        it('gets notifications', function() {
          req.body = { notificationIds: [] };
          spyOn(Notification, 'findUnread').andReturn({
            then: function(cbS, cbF) { return cbS([{ _id: '123' }]); }
          });
          NotificationHandler.user.userId.unread.get(req, res);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith([{ _id: '123' }]);
        });

      });

      describe('markread: ', function() {
        it('handles no notificationIds', function() {
          NotificationHandler.user.userId.markread.put(req, res);
          expect(res.status).toHaveBeenCalledWith(412);
          expect(res.send).toHaveBeenCalledWith('Invalid inputs');
        });

        it('handles error getting notifications', function() {
          req.body = { notificationIds: [] };
          spyOn(Notification, 'find').andReturn({
            exec: function() {
              return {
                then: function(cbS, cbF) { return cbF('ERROR'); }
              };
            }
          });
          NotificationHandler.user.userId.markread.put(req, res);
          expect(res.status).toHaveBeenCalledWith(503);
          expect(res.send).toHaveBeenCalledWith('ERROR');
        });

        it('handles error saving notifications', function() {
          req.body = { notificationIds: [] };
          spyOn(Notification, 'find').andReturn({
            exec: function() {
              return {
                then: function(cbS, cbF) { return cbS([]); }
              };
            }
          });
          spyOn(utils, 'saveAll').andCallFake(function(docs, cb) {
            return cb(['ERROR']);
          });
          NotificationHandler.user.userId.markread.put(req, res);
          expect(res.status).toHaveBeenCalledWith(503);
          expect(res.send).toHaveBeenCalledWith(['ERROR']);
        });

        it('successfully marks messages read', function() {
          req.body = { notificationIds: [] };
          var notifications = [ { _id: '123', viewed: false } ];
          spyOn(Notification, 'find').andReturn({
            exec: function() {
              return {
                then: function(cbS, cbF) { return cbS(notifications); }
              };
            }
          });
          spyOn(utils, 'saveAll').andCallFake(function(docs, cb) {
            return cb([]);
          });
          NotificationHandler.user.userId.markread.put(req, res);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith('Successfully marked notifications read');
          expect(notifications).toEqual([{ _id: '123', viewed: true }]);
        });
      });
    });
  });
});
