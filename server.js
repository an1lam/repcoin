var express = require('express');
var app = express();

var port = process.env.PORT || 8080; // set up our port

app.use(require('connect-livereload')());
app.use(express.static('./build'));

/* GET home page. */
app.get('/', function(req, res) {
    res.render('index.html');
});

app.listen(port); // startup our app at http://localhost:8080
console.log('Listening at port ' + port); // shoutout to the user!

module.exports = app;

