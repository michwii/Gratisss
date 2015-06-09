var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var async = require('async');
var cors = require("cors");
var usersRoutes = require(__dirname + '/routes/usersRoutes');
var echantillonsRoutes = require(__dirname + '/routes/echantillonsRoutes');
var codesReductionRoutes = require(__dirname + '/routes/codesReductionRoutes');
var utils = require(__dirname + '/services/utils.js');
var userService = require(__dirname + '/services/users.js');
var echantillonService = require(__dirname + '/services/echantillon.js');



var app = express();

app.use(cors());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'chuck norris',//Je sais pas trop pourquoi on a besoin de creer une session avec un password
  resave: false,
  saveUninitialized: true
}));

usersRoutes.initRoute(app);
echantillonsRoutes.initRoute(app);
codesReductionRoutes.initRoute(app);

app.get('/', function (req, res) {
	var session = req.session;
	var userConnected = session.user;
	echantillonService.getOneEchantillon({daySelection: true}, function(err, result){
		if(result == null){
			result = {};
		}
		res.render(__dirname + '/views/index.ejs', {user: userConnected, echantillonSelected: result});
	});
});



app.get('/points-de-fidelite', function (req, res) {
	console.log("point de fidelite");
	var session = req.session;
	var userConnected = session.user;
	res.render(__dirname + '/views/fidelite.ejs', {user: userConnected});
});

app.get('/bons-de-reduction', function (req, res) {
	var session = req.session;
	var userConnected = session.user;
	res.render(__dirname + '/views/coming-soon.ejs', {user: userConnected});
});


var server = app.listen(80, function(){
	console.log("The server has been launched");
});
