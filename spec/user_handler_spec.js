process.env.NODE_ENV = 'test';
var UserHandler = require('../api/handlers/user.js');

var Category = require('../api/models/Category.js');
var Transaction = require('../api/models/Transaction.js');
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

  describe('verify: ', function() {
    describe('post: ', function() {
      it('handles no verification token', function() {
        UserHandler.verify.post(req, res);
        expect(res.status).toHaveBeenCalledWith(412);
        expect(res.send).toHaveBeenCalledWith('No verification token provided');
      });

      it('handles error finding verification token', function() {
          req.body = { verificationToken : '123' };
          spyOn(VerificationToken, 'findOne').andCallFake(function(query, cb) {
            return cb('Error', null);
          });
          UserHandler.verify.post(req, res);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('Error');
      });

      it('handles a null verification token', function() {
          req.body = { verificationToken : '123' };
          spyOn(VerificationToken, 'findOne').andCallFake(function(query, cb) {
            return cb(null, null);
          });
          UserHandler.verify.post(req, res);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('No verification token found');
      });

      it('handles a triggered verification token', function() {
          req.body = { verificationToken : '123' };
          spyOn(VerificationToken, 'findOne').andCallFake(function(query, cb) {
            return cb(null, { triggered: true });
          });
          UserHandler.verify.post(req, res);
          expect(res.status).toHaveBeenCalledWith(501);
          var msg = 'Verification token has already been used. Please return to the home page and log in.';
          expect(res.send).toHaveBeenCalledWith(msg);
      });

      it('handles error updating user', function() {
          req.body = { verificationToken : '123' };
          spyOn(VerificationToken, 'findOne').andCallFake(function(query, cb) {
            return cb(null, { triggered: false });
          });
          spyOn(User, 'findOneAndUpdate').andCallFake(function(arg1, arg2, cb) {
            return cb('Error', null);
          });
          UserHandler.verify.post(req, res);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('Error');
      });

      it('handles error logging in user', function() {
          req.body = { verificationToken : '123' };
          spyOn(VerificationToken, 'findOne').andCallFake(function(query, cb) {
            return cb(null, { triggered: false, save: jasmine.createSpy().andReturn() });
          });
          spyOn(User, 'findOneAndUpdate').andCallFake(function(arg1, arg2, cb) {
            return cb(null, { _id: '123' });
          });
          req.login = jasmine.createSpy().andCallFake(function(user, cb) {
            return cb('Error');
          });
          UserHandler.verify.post(req, res);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('Error');
      });

      it('logs in the user', function() {
          req.body = { verificationToken : '123' };
          spyOn(VerificationToken, 'findOne').andCallFake(function(query, cb) {
            return cb(null, { triggered: false, save: jasmine.createSpy().andReturn() });
          });
          spyOn(User, 'findOneAndUpdate').andCallFake(function(arg1, arg2, cb) {
            return cb(null, { _id: '123' });
          });
          req.login = jasmine.createSpy().andCallFake(function(user, cb) {
            return cb(null);
          });
          UserHandler.verify.post(req, res);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith({ _id: '123' });
      });
    });
  });

  describe('users: ', function() {
    describe('trending: ', function() {
      describe('experts: ', function() {
        describe('get: ', function() {
          var transactionPromise;
          beforeEach(function() {
            transactionPromise = {
              userIds: [
                { _id: '123' },
                { _id: '456' },
              ],

              then: function(cb) {
                return cb(this.userIds);
              }
            };
          });

          it('handles error finding users ids', function() {
            spyOn(Transaction, 'findTrendingExperts').andReturn(transactionPromise);
            spyOn(User, 'findPublic').andCallFake(function(query, cb) {
              return cb('Error', null);
            });
            UserHandler.users.trending.experts.get(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(res.send).toHaveBeenCalledWith('Error');
          });

          it('finds trending users', function() {
            var users = [
              { _id: '123' },
              { _id: '456' },
            ]
            spyOn(Transaction, 'findTrendingExperts').andReturn(transactionPromise);
            spyOn(User, 'findPublic').andCallFake(function(query, cb) {
              return cb(null, users);
            });
            UserHandler.users.trending.experts.get(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(users);
          });
        });
      });
    });

    describe('get: ', function() {
      it('finds users properly with no search term', function() {
        spyOn(User, 'findPublic').andCallFake(function(query, cb) {
          return cb(null, [{ username: 'Matt Ritter'}]);
        });
        UserHandler.users.get(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([{ username: 'Matt Ritter'}]);
      });

      it('properly handles error finding users with no search term', function() {
        spyOn(User, 'findPublic').andCallFake(function(query, cb) {
          return cb('Error', null);
        });
        UserHandler.users.get(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.send).toHaveBeenCalledWith('Error');
      });

      it('properly gets users with a search term', function() {
        spyOn(User, 'findBySearchTermPublic').andCallFake(function(query, cb) {
          return cb(null, [{ username: 'Matt Ritter'}]);
        });
        req.query = { searchTerm: 'Matt' };
        UserHandler.users.get(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([{ username: 'Matt Ritter'}]);
      });

      it('properly handles error getting users with a search term', function() {
        spyOn(User, 'findBySearchTermPublic').andCallFake(function(query, cb) {
          return cb('Error', null);
        });
        req.query = { searchTerm: 'Matt' };
        UserHandler.users.get(req, res);
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
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith({ username: 'Matt'});
        });

        it('properly handles error from no id list', function() {
          UserHandler.users.listByIds.get(req, res);
          expect(res.status).toHaveBeenCalledWith(412);
          expect(res.send).toHaveBeenCalledWith('No id list provided');
        });

        it('properly handles Mongo error', function() {
          spyOn(User, 'findPublic').andCallFake(function(query, cb) {
            return cb('Error', null);
          });
          req.query = { idList: ['123'] };
          UserHandler.users.listByIds.get(req, res);
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
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith([{ username: 'Matt' }]);
        });

        it('properly handles invalid inputs', function() {
          UserHandler.users.leaders.get(req, res);
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
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('Error');
        });
      });

      describe('put: ', function() {
        it('properly handles invalid inputs', function() {
          req.params = { user_id: '123' };
          req.body = { picture: {} };
          UserHandler.users.userId.put(req, res);
          expect(res.status).toHaveBeenCalledWith(412);
          expect(res.send).toHaveBeenCalledWith('Invalid inputs');
        });

        it('properly handles an error finding the user', function() {
          spyOn(User, 'findById').andCallFake(function(query, cb) {
            return cb('Error', null);
          });
          req.params = { user_id: '123' };
          UserHandler.users.userId.put(req, res);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('Error');
        });

        it('properly handles an null user', function() {
          spyOn(User, 'findById').andCallFake(function(query, cb) {
            return cb(null, null);
          });
          req.params = { user_id: '123' };
          UserHandler.users.userId.put(req, res);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('No user found with id: 123');
        });

        it('properly handles invalid link inputs', function() {
          spyOn(User, 'findById').andCallFake(function(query, cb) {
            return cb(null, { username: 'Matt' });
          });
          req.params = { user_id: '123' };
          req.body = { links: [ {} ] };
          UserHandler.users.userId.put(req, res);
          expect(res.status).toHaveBeenCalledWith(412);
          expect(res.send).toHaveBeenCalledWith('Invalid link inputs');
        });

        it('properly handles error saving user', function() {
          var user = {
            username: 'Matt',
            save: jasmine.createSpy().andCallFake(function(cb) {
              cb('Error', null);
            })
          };
          spyOn(User, 'findById').andCallFake(function(query, cb) {
            return cb(null, user);
          });
          req.params = { user_id: '123' };
          UserHandler.users.userId.put(req, res);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('Error');
        });

        it('updates and saves user', function() {
          var expectedUser = {
            about: 'foo',
            username: 'bar',
            defaultCategory: 'Ballet',
            picture: { url: 'blah', public_id: 'boo' }
          };

          var user = {
            username: 'Matt',
            save: jasmine.createSpy().andCallFake(function(cb) {
              cb(null, expectedUser);
            })
          };
          spyOn(User, 'findById').andCallFake(function(query, cb) {
            return cb(null, user);
          });
          req.params = { user_id: '123' };
          req.body = expectedUser;
          UserHandler.users.userId.put(req, res);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith(expectedUser);
        });
      });

      describe('delete: ', function() {
        it('properly deletes a given user', function() {
          spyOn(User, 'remove').andCallFake(function(query, cb) {
            return cb(null, { username: 'Matt' });
          });
          req.params = { user_id: '123' };
          UserHandler.users.userId.delete(req, res);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.send).toHaveBeenCalledWith({ username: 'Matt' });
        });

        it('properly handles deleting a user that is not found', function() {
          spyOn(User, 'remove').andCallFake(function(query, cb) {
            return cb(null, null);
          });
          req.params = { user_id: '123' };
          UserHandler.users.userId.delete(req, res);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('No user was found with id: 123');
        });

        it('properly handles an error finding the user', function() {
          spyOn(User, 'remove').andCallFake(function(query, cb) {
            return cb('Error', null);
          });
          req.params = { user_id: '123' };
          UserHandler.users.userId.delete(req, res);
          expect(res.status).toHaveBeenCalledWith(501);
          expect(res.send).toHaveBeenCalledWith('Error');
        });
      });

      describe('investorCategory: ', function() {
        describe('delete: ', function() {
          var categoryPromise;

          beforeEach(function() {
            categoryPromise = {
              category: {
                name: 'Coding',
                investors: 2,
                save: jasmine.createSpy().andReturn()
              },
              then: function(cb) {
                return cb(this.category);
              }
            };
            spyOn(Category, 'findByName').andReturn(categoryPromise);
          });

          it('properly handles an error finding the user', function() {
            spyOn(User, 'findById').andCallFake(function(query, cb) {
              return cb('Error', null);
            });
            req.params = { user_id: '123', category_name: 'Foo' };
            UserHandler.users.userId.investorCategory.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(res.send).toHaveBeenCalledWith('Error');
          });

          it('properly handles a null user', function() {
            spyOn(User, 'findById').andCallFake(function(query, cb) {
              return cb(null, null);
            });
            req.params = { user_id: '123' };
            UserHandler.users.userId.investorCategory.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(res.send).toHaveBeenCalledWith('No user found with id: 123');
          });

          it('properly handles when the user is not an investor for this category', function() {
            spyOn(User, 'findById').andCallFake(function(query, cb) {
              return cb(null, { username: 'Matt' });
            });
            spyOn(utils, 'isInvestor').andReturn(false);
            req.params = { user_id: '123' };
            UserHandler.users.userId.investorCategory.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({username: 'Matt' });
          });

          it('properly handles an error updating investors\' experts', function() {
            spyOn(User, 'findById').andCallFake(function(query, cb) {
              return cb(null, { username: 'Matt' });
            });
            spyOn(utils, 'isInvestor').andReturn(true);
            spyOn(utils, 'getInvestorsExperts').andReturn({});
            spyOn(utils, 'updateInvestorsExperts').andCallFake(
              function(experts, categoryName, userId, cb) {
                cb('Error');
              });
            req.params = { user_id: '123' };
            UserHandler.users.userId.investorCategory.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(res.send).toHaveBeenCalledWith('Error');
          });

          it('properly handles an error saving the user', function() {
            var user = {
              username: 'Matt',
              save: jasmine.createSpy().andCallFake(function(cb) {
                cb('Error', null);
              })
            };
            spyOn(User, 'findById').andCallFake(function(query, cb) {
              return cb(null, { username: 'Matt' });
            });
            spyOn(utils, 'isInvestor').andReturn(true);
            spyOn(utils, 'getInvestorsExperts').andReturn({});
            spyOn(utils, 'updateInvestorsExperts').andCallFake(
              function(experts, categoryName, userId, cb) {
                cb(null);
              });
            spyOn(utils, 'deleteInvestorCategory').andReturn(user);
            req.params = { user_id: '123', category_name: 'Foo' };
            UserHandler.users.userId.investorCategory.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(res.send).toHaveBeenCalledWith('Error');
          });

          it('deletes the category and saves user', function() {
            var user = {
              username: 'Matt',
              save: jasmine.createSpy().andCallFake(function(cb) {
                cb(null, { username: 'Matt' });
              })
            };
            spyOn(User, 'findById').andCallFake(function(query, cb) {
              return cb(null, user);
            });
            spyOn(utils, 'isInvestor').andReturn(true);
            spyOn(utils, 'getInvestorsExperts').andReturn({});
            spyOn(utils, 'updateInvestorsExperts').andCallFake(
              function(investors, categoryName, userId, cb) {
                cb(null);
              });
            spyOn(utils, 'deleteInvestorCategory').andReturn(user);
            req.params = { user_id: '123', categoryName: 'Foo' };
            UserHandler.users.userId.investorCategory.delete(req, res);
            expect(categoryPromise.category.investors).toEqual(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ username: 'Matt' });
          });
        });
      });

      describe('expertCategory: ', function() {
        describe('delete: ', function() {
          var categoryPromise;
          beforeEach(function() {
            categoryPromise = {
              category: {
                name: 'Coding',
                experts: 2,
                save: jasmine.createSpy().andReturn()
              },
              then: function(cb) {
                return cb(this.category);
              }
            };
            spyOn(Category, 'findByName').andReturn(categoryPromise);
          });

          it('properly handles an error finding the user', function() {
            spyOn(User, 'findById').andCallFake(function(query, cb) {
              return cb('Error', null);
            });
            req.params = { user_id: '123', category_name: 'Foo' };
            UserHandler.users.userId.expertCategory.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(res.send).toHaveBeenCalledWith('Error');
          });

          it('properly handles a null user', function() {
            spyOn(User, 'findById').andCallFake(function(query, cb) {
              return cb(null, null);
            });
            req.params = { user_id: '123' };
            UserHandler.users.userId.expertCategory.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(res.send).toHaveBeenCalledWith('No user found with id: 123');
          });

          it('properly handles when the user is not an expert for this category', function() {
            spyOn(User, 'findById').andCallFake(function(query, cb) {
              return cb(null, { username: 'Matt' });
            });
            spyOn(utils, 'isExpert').andReturn(false);
            req.params = { user_id: '123' };
            UserHandler.users.userId.expertCategory.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({username: 'Matt' });
          });

          it('properly handles an error reimbursing investors', function() {
            spyOn(User, 'findById').andCallFake(function(query, cb) {
              return cb(null, { username: 'Matt' });
            });
            spyOn(utils, 'isExpert').andReturn(true);
            spyOn(utils, 'getInvestors').andReturn({});
            spyOn(utils, 'reimburseInvestors').andCallFake(
              function(investors, categoryName, userId, cb) {
                cb('Error');
              });
            req.params = { user_id: '123' };
            UserHandler.users.userId.expertCategory.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(res.send).toHaveBeenCalledWith('Error');
          });

          it('properly handles an error saving the user', function() {
            var user = {
              username: 'Matt',
              save: jasmine.createSpy().andCallFake(function(cb) {
                cb('Error', null);
              })
            };
            spyOn(User, 'findById').andCallFake(function(query, cb) {
              return cb(null, { username: 'Matt' });
            });
            spyOn(utils, 'isExpert').andReturn(true);
            spyOn(utils, 'getInvestors').andReturn({});
            spyOn(utils, 'reimburseInvestors').andCallFake(
              function(investors, categoryName, userId, cb) {
                cb(null);
              });
            spyOn(utils, 'deleteExpertCategory').andReturn(user);
            req.params = { user_id: '123', category_name: 'Foo' };
            UserHandler.users.userId.expertCategory.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(res.send).toHaveBeenCalledWith('Error');
          });

          it('deletes the category and saves user', function() {
            var user = {
              username: 'Matt',
              save: jasmine.createSpy().andCallFake(function(cb) {
                cb(null, { username: 'Matt' });
              })
            };
            spyOn(User, 'findById').andCallFake(function(query, cb) {
              return cb(null, user);
            });
            spyOn(utils, 'isExpert').andReturn(true);
            spyOn(utils, 'getInvestors').andReturn({});
            spyOn(utils, 'reimburseInvestors').andCallFake(
              function(investors, categoryName, userId, cb) {
                cb(null);
              });
            spyOn(utils, 'deleteExpertCategory').andReturn(user);
            req.params = { user_id: '123', categoryName: 'Foo' };
            UserHandler.users.userId.expertCategory.delete(req, res);
            expect(categoryPromise.category.experts).toEqual(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ username: 'Matt' });
          });
        });
      });
    });
  });
});
