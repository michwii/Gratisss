var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var md5 = require('MD5');
var async = require('async');
var usersRoutes = require(__dirname + '/routes/usersRoutes');
var utils = require(__dirname + '/services/utils.js');
var userService = require(__dirname + '/services/users.js');



var app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'chuck norris',//Je sais pas trop pourquoi on a besoin de creer une session avec un password
  resave: false,
  saveUninitialized: true
}))

usersRoutes.initRoute(app);


app.get('/', function (req, res) {
	var session = req.session;
	var userConnected = session.user;
	res.render(__dirname + '/views/index.ejs', {user: userConnected});
});



app.get('/points-de-fidelite', function (req, res) {
	var session = req.session;
	var userConnected = session.user;
	res.render(__dirname + '/views/fidelite.ejs', {user: userConnected});
});

app.get('/echantillons-gratuits', function (req, res) {
	var session = req.session;
	var userConnected = session.user;
	res.render(__dirname + '/views/coming-soon.ejs', {user: userConnected});
});

app.get('/codes-de-reduction', function (req, res) {
	var session = req.session;
	var userConnected = session.user;
	res.render(__dirname + '/views/coming-soon.ejs', {user: userConnected});
});

app.get('/bons-de-reduction', function (req, res) {
	var session = req.session;
	var userConnected = session.user;
	res.render(__dirname + '/views/coming-soon.ejs', {user: userConnected});
});


var server = app.listen(80, function(){
	console.log("The server has been launched");
});
