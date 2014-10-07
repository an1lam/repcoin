var should = require('should');
var request = require('supertest');
var app = require('../server.js');
var mongoose = require('mongoose');
var db = require('../config/db');

describe('app', function () {
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
 
  it('should reponse to a get request to home', function (done) {
    request(app)
      .get('/')
      .expect(200, done);
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
        .expect(200, done);
    });
  });
});
