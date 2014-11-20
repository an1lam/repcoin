"use strict";
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var agenda = require('agenda');
var path = require('path');
var LocalStrategy = require('passport-local').Strategy;
require('./config/pass.js')(passport, LocalStrategy);

// Get CWD
var STATIC_PATH = path.join(process.env.PWD, 'public');

// Mock authentication if test environment
if (!module.parent) {
 var auth = require('./config/auth.js');
} else {
 var auth = function(req, res, next) { res.status(200).end(); };
}

var app = express();

// Configure bodyParser to parse post requests
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

// Configure ORM and database
var db = require('./config/db');
var port = process.env.PORT || 8080; // set up our port

app.use(express.static(STATIC_PATH));
console.log('Serving static files from ' + __dirname + '/public');

app.set('views', STATIC_PATH);
app.engine('.html', require('jade').__express);


app.use(session({
  secret: 'ubermensch',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
/* GET the starting page for our app.
   This is the bridge to all of the react components */
app.get('/', function(req, res) {
  res.render('index.html');
});

/////////// Routes /////////////////////////

// Users
var userRouter = express.Router();
var userRoutes = require('./api/routes/UserRoutes.js')(userRouter, auth);

// Categories
var categoryRouter = express.Router();
var categoryRoutes = require('./api/routes/CategoryRoutes.js')(categoryRouter, auth);

// Authentication
var authRouter = express.Router();
var authRoutes = require('./api/routes/AuthRoutes.js')(authRouter, passport);

// Transactions
var transactionRouter = express.Router();
var transactionRoutes = require('./api/routes/TransactionRoutes.js')(transactionRouter, auth);

// Uploads
var uploadsRouter = express.Router();
var uploadRoutes = require('./api/routes/UploadRoutes.js')(uploadsRouter, auth);

app.use('/api', [authRouter, categoryRouter, userRouter, transactionRouter, uploadsRouter ]);

// Start the server unless we are running a test
if (!module.parent) {
  if (process.env.NODE_ENV === 'production') {
    var mongoUrl = db.production_url;
  }
  else {
    var mongoUrl = db.development_url;
  }
  mongoose.connect(mongoUrl);
  console.log('Listening at port ' + port);
  app.listen(port); // startup our app at http://localhost:8080
}

// Config scheduled jobs
var Agenda = require('agenda');
var agenda = new Agenda({db: {address: mongoUrl}});
require('./api/jobs/user.js')(agenda);
agenda.start();

module.exports = app;
