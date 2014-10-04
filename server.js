var express = require('express');
var app = express();

var port = process.env.PORT || 8080; // set up our port

app.use(require('connect-livereload')());
app.use(express.static('./build'));

/* GET the starting page for our app. 
  This is the bridge to all of the react component*/
app.get('/', function(req, res) {
    res.render('index.html');
});

app.listen(port); // startup our app at http://localhost:8080
console.log('Listening at port ' + port); // shoutout to the user!

module.exports = app;

