process.env.NODE_ENV = 'test';

var Q = require('q');

var CategoryHandler = require('../api/handlers/category.js');

var Transaction = require('../api/models/Transaction.js');
var User = require('../api/models/User.js');

var transporter = require('../config/mailer.js');
var winston = require('winston');

describe('CategoryHandler: ', function() {
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
      end: jasmine.createSpy(),
      then: function(cb) {
        cb();
      }
    };
  });

  afterEach(function() {
  });

  describe('categories: ', function() {
    describe('getHot: ', function() {
      var hotCategories = [{ _id: 'foo' }];
      var hotUsers = [{ _id: { name: 'foo', id: '54adabbc8533650b00ee3508' } }];
      var hotUsersPictureAndAbout = {
         picture: {url: 'test.com'}, about: 'Test'};
      it('returns the hot categories with the corresponding users',
        function() {
        spyOn(User, 'getUserPictureAndAbout').andReturn({
          then: function(cbS, cbF) {
            return cbS(hotUsersPictureAndAbout);
          }
        });

        spyOn(Transaction, 'getHotCategories').andReturn({
          then: function(cbS, cbF) {
            return cbS(hotCategories)
          }
        });

        spyOn(Transaction, 'getHotUsersInCategory').andReturn({
          then: function(cbS, cbF) {
            return cbS(hotUsers);
          }
        });

        var cb = function() {
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith([{
            _id: 'foo',
            users: [{
              name: 'foo',
              id: 'bar',
              picture: {
                url: 'test.com'
              },
              about: 'test'
            }]
          }]);
          expect(res.status.callCount).toEqual(1);
          expect(res.send.callCount).toEqual(1);
        };

        Q.when(CategoryHandler.categories.getHot(req, res), cb);
      })
    })
  })
});
