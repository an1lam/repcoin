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

  it('should response to a get request to home', function (done) {
    request(app)
      .get('/')
      .expect(200, done);
  });
});
