"use strict";

var express = require('express');
var mongoose = require('mongoose');
var app = express();

// configuration
var db = require('./config/db');

var port = process.env.PORT || 8080; // set up our port
mongoose.connect(db.url)

app.use(require('connect-livereload')());
app.use(express.static('./build'));

/* GET the starting page for our app. 
  This is the bridge to all of the react components */
app.get('/', function(req, res) {
    res.render('index.html');
});

// Routes
var dataRouter = express.Router();
var categoryRoutes = require('./api/routes/CategoryRouter.js')(dataRouter);
var userRoutes = require('./api/routes/UserRouter.js')(dataRouter);

app.listen(port); // startup our app at http://localhost:8080
console.log('Listening at port ' + port); // shoutout to the user!

app.use('/api', dataRouter);
module.exports = app;
