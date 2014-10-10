var should = require('should');
var request = require('supertest');
var app = require('../server.js');
var mongoose = require('mongoose');
var db = require('../config/db');

describe('Authentication and Session Management', function () {
  before (function (done) {
    mongoose.connect(db.test_url);
    mongoose.connection.db.dropDatabase();
    done();
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase();
    mongoose.disconnect();
    done();
  });

  describe('authentication routes', function() {
    it('should return false for loggedin before logging in', function(done) {
      request(app)
        .get('/api/loggedin')
        .expect(200)
        .expect('false', done);
    });
  });

  describe('user routes', function() {
    var userid = "";
    it('should successfully create a user', function(done) {
      var user = { username : 'testeruser', password: 'testuser', phoneNumber : '2234567890' };
      request(app)
        .post('/api/users')
        .send(user)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
            done();
          } else {
            userid = res.body._id;
            done();
          }
        });
    });

    it('should successfully get all users', function(done) {
      request(app)
        .get('/api/users')
        .expect(200, done);
    });

    it('should successfully get a user', function(done) {
      request(app)
        .get('/api/users/' + userid)
        .expect(200, done);
    });

    it('should successfully update a user', function(done) {
      var user = { username : 'newtesteruser', password: 'testuser', phoneNumber : '2234567890' };
      function hasNewUsername(res) {
        if (!(res.body.username == 'newtesteruser')) {
          throw new Error('user was not properly updated');
        }
      }

      request(app)
        .put('/api/users/' + userid)
        .send(user)
        .expect(200)
        .expect(hasNewUsername)
        .end(done);
    });

    it('should successfully delete a user', function(done) {
      request(app)
        .delete('/api/users/' + userid)
        .expect(200, done);
    });
  });
});
