process.env.NODE_ENV = 'test';
var UserHandler = require('../api/handlers/user.js');

var User = require('../api/models/User.js');
var VerificationToken = require('../api/models/VerificationToken.js');

var transporter = require('../config/mailer.js').transporterFactory();
var winston = require('winston');
var utils = require('../api/routes/utils.js');

describe('UserHandler: ', function() {
  var req, res;
  beforeEach(function() {
    spyOn(winston, 'log').andCallFake(function(arg1, arg2, arg3, arg4) {
      return;
    });

    req = {
      query: {},
      params: {},
      body: {}
    };

    res = {
      status: jasmine.createSpy().andCallFake(function(msg) {
        return this;
      }),
      send: jasmine.createSpy().andCallFake(function(msg) {
        return this;
      }),
      end: jasmine.createSpy()
    };
  });

  describe('users: ', function() {
    describe('get: ', function() {
      it('finds users properly with no search term', function() {
        spyOn(User, 'findPublic').andCallFake(function(query, cb) {
          return cb(null, [{ username: 'Matt Ritter'}]);
        });
        UserHandler.users.get(req, res);
        expect(res.status.callCount).toEqual(1);
        expect(res.send.callCount).toEqual(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([{ username: 'Matt Ritter'}]);
      });

      it('properly handles error finding users with no search term', function() {
        spyOn(User, 'findPublic').andCallFake(function(query, cb) {
          return cb('Error', null);
        });
        UserHandler.users.get(req, res);
        expect(res.status.callCount).toEqual(1);
        expect(res.send.callCount).toEqual(1);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.send).toHaveBeenCalledWith('Error');
      });

      it('properly gets users with a search term', function() {
        spyOn(User, 'findBySearchTermPublic').andCallFake(function(query, cb) {
          return cb(null, [{ username: 'Matt Ritter'}]);
        });
        req.query = { searchTerm: 'Matt' };
        UserHandler.users.get(req, res);
        expect(res.status.callCount).toEqual(1);
        expect(res.send.callCount).toEqual(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([{ username: 'Matt Ritter'}]);
      });

      it('properly handles error getting users with a search term', function() {
        spyOn(User, 'findBySearchTermPublic').andCallFake(function(query, cb) {
          return cb('Error', null);
        });
        req.query = { searchTerm: 'Matt' };
        UserHandler.users.get(req, res);
        expect(res.status.callCount).toEqual(1);
        expect(res.send.callCount).toEqual(1);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.send).toHaveBeenCalledWith('Error');
      });
    });
  });
});
