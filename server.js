'use strict';

require('newrelic');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var express = require('express');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var session = require('express-session');
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  FacebookTokenStrategy = require('passport-facebook-token').Strategy;
var path = require('path');
// Configure passport
require('./config/pass.js')(passport, LocalStrategy, FacebookTokenStrategy);
var mailerConfig = require('./config/mailer.js');
var winston = require('winston');

winston.info('Starting up application');

// Get CWD
var STATIC_PATH = path.join(process.env.PWD, 'public');

// Mock authentication if test environment
if (!module.parent) {
  winston.info('Using config/auth');
  var auth = require('./config/auth.js');
} else {
  winston.info('Test environment found; using mock auth');
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
winston.log('info', 'Serving static files from %s', __dirname + '/public');

app.set('views', STATIC_PATH);
app.engine('.html', require('jade').__express);

app.use(cookieSession({
  keys: ['ubermensch1', 'ubermensch2'],
}));

app.use(passport.initialize());
app.use(passport.session());
/* GET the starting page for our app.
   This is the bridge to all of the react components */
app.get('/', function(req, res) {
  res.render('index.html');
});

// ACL middleware
var acl = require('./config/acl.js');

/////////// Routes /////////////////////////

// Users
var userRouter = express.Router();
var userRoutes = require('./api/routes/UserRoutes.js')(userRouter, auth, acl);

// Categories
var categoryRouter = express.Router();
var categoryRoutes = require('./api/routes/CategoryRoutes.js')(categoryRouter, auth, acl);

// Nodemailer Setup
var transporter = nodemailer.createTransport({
  service: process.env.REPCOIN_EMAIL_SERVICE,
  auth: mailerConfig.fromUser,
});

/////////// Routes /////////////////////////

// Authentication
var authRouter = express.Router();
var authRoutes = require('./api/routes/AuthRoutes.js')(authRouter, passport);

// Categories
var categoryRouter = express.Router();
var categoryRoutes = require('./api/routes/CategoryRoutes.js')(categoryRouter, auth, acl);

// Non-model associated
var comboRouter = express.Router();
var comboRoutes = require('./api/routes/ComboRoutes.js')(comboRouter, auth, acl);

// Transactions
var transactionRouter = express.Router();
var transactionRoutes = require('./api/routes/TransactionRoutes.js')(transactionRouter, auth, acl);

// Uploads
var uploadsRouter = express.Router();
var uploadRoutes = require('./api/routes/UploadRoutes.js')(uploadsRouter, auth, acl);

// Users
var userRouter = express.Router();
var userRoutes = require('./api/routes/UserRoutes.js')(userRouter, auth, acl);

app.use('/api', [authRouter, categoryRouter, comboRouter, userRouter, transactionRouter, uploadsRouter ]);

// Start the server unless we are running a test
if (!module.parent) {
  if (process.env.NODE_ENV === 'production') {
    winston.log('info', 'Starting the server with environment: %s', process.env.NODE_ENV);
    var mongoUrl = db.production_url;
  }
  else {
    process.env.NODE_ENV = "development";
    winston.log('info', 'Starting the server with environment: %s', process.env.NODE_ENV);
    var mongoUrl = db.development_url;
  }
  mongoose.connect(mongoUrl);
  winston.log('info', 'Listening at port %d', port);
  app.listen(port); // startup our app at http://localhost:8080
}

module.exports = app;
