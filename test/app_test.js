var should = require('should');
var http = require('http');
var app = require('../server.js');
var port = 3333;
var server;

function defaultGetOptions(path) {
  var options = {
    "host": "localhost",
    "port": port,
    "path": path,
    "method": "GET"
  };
  return options;
}

describe('app', function () {
  before (function (done) {
    server = app.listen(port, function (err, result) {
      if (err) {
        done(err);
      } else {
        done();
      }
    });
  });
 
  after(function (done) {
    server.close();
    done();
  });
 
  it('should exist', function (done) {
    should.exist(app);
    done();
  });
 
  it('should be listening at localhost:3333', function (done) {
    var headers = defaultGetOptions('/');
    http.get(headers, function (res) {
      res.statusCode.should.eql(200);
      done();
    });
  });

  describe('authentication routes', function() {
    it('should return false for loggedin before logging in', function(done) {
      var headers = defaultGetOptions('/api/loggedin');
      http.get(headers, function(res) {
        var body = '';
        res.on('data', function(chunk) {
          body += chunk;
        });
        res.on('end', function() {
          body.should.equal('false');
          done();
        });
      });
    });
  });
});
