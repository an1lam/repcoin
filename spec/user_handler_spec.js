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

    describe('listByIds: ', function() {
      describe('get: ', function() {
        it('successfully finds users with an id list', function() {
          spyOn(User, 'findPublic').andCallFake(function(query, cb) {
            return cb(null, { username: 'Matt' });
          });
          req.query = { idList: ['123'] };
          UserHandler.users.listByIds.get(req, res);
          expect(res.status.callCount).toEqual(1);
          expect(res.send.callCount).toEqual(1);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith({ username: 'Matt'});
        });

        it('properly handles error from no id list', function() {
          UserHandler.users.listByIds.get(req, res);
          expect(res.status.callCount).toEqual(1);
          expect(res.send.callCount).toEqual(1);
          expect(res.status).toHaveBeenCalledWith(412);
          expect(res.send).toHaveBeenCalledWith('No id list provided');
        });

        it('properly handles Mongo error', function() {
          spyOn(User, 'findPublic').andCallFake(function(query, cb) {
            return cb('Error', null);
          });
          req.query = { idList: ['123'] };
          UserHandler.users.listByIds.get(req, res);
          expect(res.status.callCount).toEqual(1);
          expect(res.send.callCount).toEqual(1);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('Error');
        });
      });
    });

    describe('leaders: ', function() {
      describe('get: ', function() {
        var users = [ { categories: [ { name: 'Foo', percentile: 20 } ] } ];

        it('gets the leaders for a given category', function() {
          spyOn(User, 'findNLeadersPublic').andCallFake(function(query, category, count, cb) {
            return cb(null, [{ username: 'Matt' }]);
          });
          req.query = { expert: '1' };
          req.params = { categoryName: 'Foo', count: '10' };
          UserHandler.users.leaders.get(req, res);
          expect(User.findNLeadersPublic.callCount).toEqual(1);
          expect(res.status.callCount).toEqual(1);
          expect(res.send.callCount).toEqual(1);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith([{ username: 'Matt' }]);
        });

        it('properly handles invalid inputs', function() {
          UserHandler.users.leaders.get(req, res);
          expect(res.status.callCount).toEqual(1);
          expect(res.send.callCount).toEqual(1);
          expect(res.status).toHaveBeenCalledWith(412);
          expect(res.send).toHaveBeenCalledWith('Invalid inputs');
        });

        it('properly handles error finding leaders', function() {
          spyOn(User, 'findNLeadersPublic').andCallFake(function(query, category, count, cb) {
            return cb('Error', null);
          });
          req.query = { expert: '1' };
          req.params = { categoryName: 'Foo', count: '10' };
          UserHandler.users.leaders.get(req, res);
          expect(User.findNLeadersPublic.callCount).toEqual(1);
          expect(res.status.callCount).toEqual(1);
          expect(res.send.callCount).toEqual(1);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('Error');
        });

      });
    });

    describe('userId: ', function() {
      describe('get: ', function() {
        it('gets the user with the public method if a different user is requesting', function() {
          spyOn(User, 'findByIdPublic').andCallFake(function(query, cb) {
            return cb(null, { username: 'Matt' });
          });
          req.params = { user_id: '123' };
          req.session = { passport: { user: '456' } };
          UserHandler.users.userId.get(req, res);
          expect(User.findByIdPublic.callCount).toEqual(1);
          expect(res.status.callCount).toEqual(1);
          expect(res.send.callCount).toEqual(1);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith({ username: 'Matt' });
        });

        it('gets the user with the private method if the same user is requesting', function() {
          spyOn(User, 'findById').andCallFake(function(query, cb) {
            return cb(null, { username: 'Matt' });
          });
          req.params = { user_id: '123' };
          req.session = { passport: { user: '123' } };
          UserHandler.users.userId.get(req, res);
          expect(User.findById.callCount).toEqual(1);
          expect(res.status.callCount).toEqual(1);
          expect(res.send.callCount).toEqual(1);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith({ username: 'Matt' });
        });

        it('properly handles a null user', function() {
          spyOn(User, 'findById').andCallFake(function(query, cb) {
            return cb(null, null);
          });
          req.params = { user_id: '123' };
          req.session = { passport: { user: '123' } };
          UserHandler.users.userId.get(req, res);
          expect(User.findById.callCount).toEqual(1);
          expect(res.status.callCount).toEqual(1);
          expect(res.send.callCount).toEqual(1);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('No user was found');
        });

        it('properly handles an error finding the user', function() {
          spyOn(User, 'findById').andCallFake(function(query, cb) {
            return cb('Error', null);
          });
          req.params = { user_id: '123' };
          req.session = { passport: { user: '123' } };
          UserHandler.users.userId.get(req, res);
          expect(User.findById.callCount).toEqual(1);
          expect(res.status.callCount).toEqual(1);
          expect(res.send.callCount).toEqual(1);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('Error');
        });
      });
    });
  });
});
