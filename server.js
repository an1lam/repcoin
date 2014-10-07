"use strict";
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
require('./config/pass.js')(passport, LocalStrategy);
var isAuthenticated = require('./config/auth.js');
var app = express();

// Configure bodyParser to parse post requests
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

// Configure ORM and database
var db = require('./config/db');
var port = process.env.PORT || 8080; // set up our port
mongoose.connect(db.url)

app.use(require('connect-livereload')());
app.use(express.static('./build'));
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
var userRoutes = require('./api/routes/UserRoutes.js')(userRouter);

// Categories
var categoryRouter = express.Router();
var categoryRoutes = require('./api/routes/CategoryRoutes.js')(categoryRouter, isAuthenticated);

// Authentication
var authRouter = express.Router();
var authRoutes = require('./api/routes/AuthRoutes.js')(authRouter, passport);

app.use('/api', [authRouter, categoryRouter, userRouter]);

// Start the server unless we are running a test
if (!module.parent) {
  console.log('Listening at port ' + port);
  app.listen(port); // startup our app at http://localhost:8080
}

module.exports = app;
