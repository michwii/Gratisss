var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var async = require('async');
var cors = require("cors");
var multer  = require('multer');
var fs = require("fs");
var mkdirp = require('mkdirp');//Sert a creer tout les sous repertoires necessaire. On l'utilise pour enregistrer un ulpoad avec comme sous folder la date du jour
var usersRoutes = require(__dirname + '/routes/usersRoutes');
var echantillonsRoutes = require(__dirname + '/routes/echantillonsRoutes');
var codesReductionRoutes = require(__dirname + '/routes/codesReductionRoutes');
var utils = require(__dirname + '/services/utils.js');
var userService = require(__dirname + '/services/users.js');
var echantillonService = require(__dirname + '/services/echantillon.js');

var app = express();

app.use(cors());
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(multer({ 
	dest: './public/img/uploads', 
	rename: function (fieldname, filename) {
		return filename.replace(/\W+/g, '-').toLowerCase();
	},
	changeDest: function(dest, req, res) {//Dans cette fonction on va generer le dossier de destination en fonction de la date du jour. 
		var stat = null;
		var currentDate = new Date();
		var currentMonth = currentDate.getMonth()+1;
		var currentDay = currentDate.getDate();
		var finalDestinationUpload = dest + '/' + currentDay + '/' + currentMonth;
		
		mkdirp.sync(finalDestinationUpload);//On creer toutes les sous directory necessaire
		return finalDestinationUpload;
	}
	
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'chuck norris',//Je sais pas trop pourquoi on a besoin de creer une session avec un password
  resave: false,
  saveUninitialized: true
}));
app.use(function (req, res, next) {
	echantillonService.getMostViewedEchantillons(function(err, result){
	
		if(result == null){
			result = {};
		}
		req.mostViewedEchantillons = result;
	
		next();
	});
});


usersRoutes.initRoute(app);
echantillonsRoutes.initRoute(app);
codesReductionRoutes.initRoute(app);

app.get('/', function (req, res) {
	var session = req.session;
	var userConnected = session.user;
	echantillonService.getOneEchantillon({daySelection: true}, function(err, result){
		console.log(err);
		if(result == null){
			result = {};
		}
		res.render(__dirname + '/views/index.ejs', {user: userConnected, echantillonSelected: result, mostViewedEchantillons: req.mostViewedEchantillons});
	});
});

app.post('/api/upload', function(req, res){
	console.log("Un upload vient d'etre demande");
	var fileUploaded = req.files.fileUpload;
	fileUploaded.path = fileUploaded.path.replace('public', "").replace(/\\/g, '/');
	var messageReturned = {};
	messageReturned.success = "ok";
	messageReturned.fileUploaded = fileUploaded;
	res.end(JSON.stringify(messageReturned));
});

app.get('/points-de-fidelite', function (req, res) {
	console.log("point de fidelite");
	var session = req.session;
	var userConnected = session.user;
	res.render(__dirname + '/views/fidelite.ejs', {user: userConnected, mostViewedEchantillons: req.mostViewedEchantillons});
});

app.get('/bons-de-reduction', function (req, res) {
	var session = req.session;
	var userConnected = session.user;
	res.render(__dirname + '/views/coming-soon.ejs', {user: userConnected, mostViewedEchantillons: req.mostViewedEchantillons});
});


var server = app.listen(80, function(){
	console.log("The server has been launched");
});
