var should = require('should');
var app = require('../server.js');
var mongoose = require('mongoose');
var passport = require('passport');
var db = require('../config/db');
var supertest = require('supertest')
var request = supertest;

describe('app', function () {
  before (function (done) {
    if (!mongoose.connection) mongoose.connect(db.test_url);
    mongoose.connection.db.dropDatabase();
    app.use(function(req, res, next) {
      req.user = {
        id: 1
      };
      req.isAuthenticated = function() {
        return true;
      };
      next()
    });
    done();
  });

  after(function (done) {
    mongoose.disconnect();
    done();
  });

  describe('Categories Routes', function () {
    var category = {
      name: "Testing",
      color: "Blue",
      ownerName: "Tester",
      quotes: ["I like tests!", "I hate tests!"]
    };

    it ('should create a new category', function (done) {
      var returnedCategory = {};
      request(app)
        .post('/api/categories')
        .send(category)
        .expect(200, done)
    });
    it('should return all of the categories', function (done) {
      var categories = [];
      request(app)
        .get('/api/categories')
        .expect(200, done)
    });
  });
});
