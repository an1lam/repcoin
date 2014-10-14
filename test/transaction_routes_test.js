var should = require('should');
var request = require('supertest');
var app = require('../server.js');
var mongoose = require('mongoose');
var db = require('../config/db');
var lib = require('./test_lib.js');

describe('Transaction Route testing', function () {
  before (function (done) {
    mongoose.connect(db.test_url);
    mongoose.connection.db.dropDatabase();
    done();
  });

  after(function (done) {
    mongoose.disconnect(done);
  });


  describe('transaction routes', function() {
    var transactionId;
    var testUserId1 = Object("");
    var testUserId2 = Object("");
    
    var testUser1 = { username : 'testUser1', password: 'testuser', phoneNumber : '2234567890' };
    var testUser2 = { username : 'testUser2', password: 'testuser', phoneNumber : '2234567891' };
    before(function(done) {
      createUser(app, request, testUser1, testUserId1);
      createUser(app, request, testUser2, testUserId2, done);
    });

    it('should successfully create a transaction', function(done) {
      var transaction = { to   : { name: 'testUser1', id: testUserId1.toString },
                         from  : { name: 'testUser2', id: testUserId2.toString },
                         amount : 100,
                         category: 'Boating' };
        request(app)
         .post('/api/transactions')
         .send(transaction)
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
  });
});
