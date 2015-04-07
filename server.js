'use strict';

require('newrelic');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var express = require('express');
var livereload = require('express-livereload');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  FacebookTokenStrategy = require('passport-facebook-token').Strategy;
var path = require('path');
// Configure passport
require('./config/pass.js')(passport, LocalStrategy, FacebookTokenStrategy);
var mailerConfig = require('./config/mailer.js');
var User = require('./api/models/User.js');
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
  var auth = function(req, res) { res.status(200).end(); };
}

var app = express();

// Configure bodyParser to parse post requests
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Configure ORM and database
var db = require('./config/db');
var port = process.env.PORT || 8080; // set up our port

app.use(express.static(STATIC_PATH));
winston.log('info', 'Serving static files from %s', __dirname + '/public');

app.set('view engine', 'ejs');
app.set('views', STATIC_PATH);

app.use(cookieSession({
  keys: ['ubermensch1', 'ubermensch2'],
}));

app.use(passport.initialize());
app.use(passport.session());
/* GET the starting page for our app.
   This is the bridge to all of the react components */
app.get('/', function(req, res) {
  User.find().limit(300).exec().then(function(users) {
    res.render('index.ejs', {
      users: users,
    });
  });
});

// ACL middleware
var acl = require('./config/acl.js');

// Censor middleware
var censor = require('./config/censor.js');

// Nodemailer Setup
nodemailer.createTransport({
  service: process.env.REPCOIN_EMAIL_SERVICE,
  auth: mailerConfig.fromUser,
});

/////////// Router initialization

// Authentication
var authRouter = express.Router();
var authRoutes = require('./api/routes/AuthRoutes.js')(authRouter, passport);

// Categories
var categoryRouter = express.Router();
var categoryRoutes = require('./api/routes/CategoryRoutes.js')(categoryRouter, auth, acl, censor);

// Non-model associated
var comboRouter = express.Router();
var comboRoutes = require('./api/routes/ComboRoutes.js')(comboRouter);

// Transactions
var transactionRouter = express.Router();
var transactionRoutes = require('./api/routes/TransactionRoutes.js')(transactionRouter, auth, acl);

// Uploads
var uploadsRouter = express.Router();
var uploadRoutes = require('./api/routes/UploadRoutes.js')(uploadsRouter, auth, acl);

// Users
var userRouter = express.Router();
var userRoutes = require('./api/routes/UserRoutes.js')(userRouter, auth, acl, censor);

// UserSnapshots
var userSnapshotRouter = express.Router();
var userSnapshotRoutes = require('./api/routes/UserSnapshotRoutes.js')(userSnapshotRouter, auth, acl, censor);

// Notifications
var notificationRouter = express.Router();
var notificationRoutes = require('./api/routes/NotificationRoutes.js')(notificationRouter, auth, acl);


app.use('/api', [authRouter, categoryRouter, comboRouter, notificationRouter, userRouter, userSnapshotRouter, transactionRouter, uploadsRouter ]);

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
