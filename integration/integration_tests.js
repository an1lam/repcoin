var app = require('../server.js');
var mongoose = require('mongoose');
var db = require('../config/db');
var request = require('supertest')
var conn;

describe('Integration Tests', function () {
  before (function (done) {
    mongoose.connect(db.test_url);
    conn = mongoose.connection;
    done();
  });

  after(function (done) {
    conn.db.dropDatabase(function(err, result) {
      mongoose.disconnect(done);
    });
  });

  describe('Auth Routes', function() {
    describe('loggedin', function () {
      it ('should return false if no parameters are provided', function (done) {
        request(app)
          .get('/api/loggedin')
          .expect(200)
          .expect('false', done)
      });
    });

    describe('user', function () {
      it ('should return empty JSON if no user logged in', function (done) {
        request(app)
          .get('/api/user')
          .expect(200)
          .expect({}, done)
      });
    });
  });

  describe('User Routes', function() {
    describe('create', function () {
      it ('should not allow missing fields', function (done) {
        request(app)
          .post('/api/users')
          .send({})
          .expect(412)
          .expect('Invalid inputs', done)
      });

      it ('creates user', function (done) {
        this.timeout(10000);
        var user = {
          firstname: 'Matt',
          lastname: 'Ritter',
          email: 'matt@matt.com',
          password: 'spartacus',
        };

        request(app)
          .post('/api/users')
          .send(user)
          .expect(200)
          .expect('Sent email', done)
      });
    });
  });
});
