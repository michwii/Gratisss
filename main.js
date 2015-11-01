var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var async = require('async');
var cors = require("cors");
var multer  = require('multer');
var fs = require("fs");
var mkdirp = require('mkdirp');//Sert a creer tout les sous repertoires necessaire. On l'utilise pour enregistrer un ulpoad avec comme sous folder la date du jour
var striptags = require('striptags');//Permet d'enlever les tags html qui ne servent a rien dans les desrciptions
var sitemap = require('sitemap');//Permet de generer dynamiquement le sitemap.xml

var usersRoutes = require(__dirname + '/routes/usersRoutes');
var echantillonsRoutes = require(__dirname + '/routes/echantillonsRoutes');
var codesReductionRoutes = require(__dirname + '/routes/codesReductionRoutes');
var utils = require(__dirname + '/services/utils.js');
var userService = require(__dirname + '/services/users.js');
var echantillonService = require(__dirname + '/services/echantillon.js');
var codesReductionService = require(__dirname + '/services/codesReduction.js');


var app = express();

app.use(cors());//Permet de faire des requetes cross domaine
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'chuck norris',//Je sais pas trop pourquoi on a besoin de creer une session avec un password
  resave: false,
  saveUninitialized: true
}));
app.use(function (req, res, next) {

	console.log("Je suis une requete midlleware");

	echantillonService.getMostViewedEchantillons(function(err, result){
	
		if(result == null){
			result = {};
		}
		req.mostViewedEchantillons = result;
	
		next();
	});
});

app.locals.removeHTMLTags = function(html) {
	return striptags(html);
}


app.use(usersRoutes);
app.use(echantillonsRoutes);
app.use(codesReductionRoutes);


app.get('/', function (req, res) {
	var session = req.session;
	var userConnected = session.user;
	echantillonService.getOneEchantillon({daySelection: true}, function(err, result){
		if(result == null){
			result = {};
		}
		res.render(__dirname + '/views/index.ejs', {user: userConnected, echantillonSelected: result, mostViewedEchantillons: req.mostViewedEchantillons});
	});
});

app.post('/api/upload', function(req, res){
	var fileUploaded = req.files.fileUpload;
	console.log("Du post " + req.body.type);
	fileUploaded.path = fileUploaded.path.replace('public', "").replace(/\\/g, '/');
	var messageReturned = {};
	messageReturned.success = "ok";
	messageReturned.fileUploaded = fileUploaded;
	res.end(JSON.stringify(messageReturned));
});

app.get('/points-de-fidelite', function (req, res) {
	var session = req.session;
	var userConnected = session.user;
	res.render(__dirname + '/views/fidelite.ejs', {user: userConnected, mostViewedEchantillons: req.mostViewedEchantillons});
});

app.get('/bons-de-reduction', function (req, res) {
	var session = req.session;
	var userConnected = session.user;
	res.render(__dirname + '/views/coming-soon.ejs', {user: userConnected, mostViewedEchantillons: req.mostViewedEchantillons});
});

app.get("/privacyPolicy", function(req, res){
	var session = req.session;
	var userConnected = session.user;
	res.render(__dirname + '/views/privacy.ejs', {user: userConnected, mostViewedEchantillons: req.mostViewedEchantillons});
});

app.get("/sitemap.xml", function(req, res){
	var mySiteMap = sitemap.createSitemap ({
		hostname: 'http://www.gratisss.fr',
		cacheTime: 600000
	});
	mySiteMap.add({url: '/', changefreq: 'daily', priority: 1});
	mySiteMap.add({url: '/echantillons-gratuits/', changefreq: 'weekly', priority: 0.8});
	mySiteMap.add({url: '/codes-de-reduction/', changefreq: 'weekly', priority: 0.8});
	mySiteMap.add({url: '/bons-de-reduction/', changefreq: 'monthly', priority: 0.8});
	mySiteMap.add({url: '/points-de-fidelite/', changefreq: 'monthly', priority: 0.5});
	mySiteMap.add({url: '/inscription/', changefreq: 'monthly', priority: 0.5});
	mySiteMap.add({url: '/connexion/', changefreq: 'monthly', priority: 0.5});
	mySiteMap.add({url: '/deconnexion/', changefreq: 'monthly', priority: 0.5});
	mySiteMap.add({url: '/privacyPolicy/', changefreq: 'monthly', priority: 0.1});
	
	echantillonService.getAllEchantillons({validated:true}, function(err, echantillonsValidated){
		for(var i = 0 ; i < echantillonsValidated.length; i++){
			mySiteMap.add({url: '/echantillons-gratuits/' + echantillonsValidated[i].urlClean + "/" + echantillonsValidated[i]._id, changefreq: 'monthly', priority: 0.5});
		}
		
		//ToDo: Une fois que chaque code de reduction aura son url modifier cette partie
		//codesReductionService.getAllCodesReduction(null, function(err, allReductionCode){
		
			//mySiteMap.add({url: '/codes-de-reduction/' + allReductionCode[i].urlClean + "/" + echantillonsValidated[i]._id, changefreq: 'monthly', priority: 0.5});

			res.header('Content-Type', 'application/xml');
			res.send( mySiteMap.toString() );
		//});

	});


});

var server = app.listen(80, function(){
	console.log("The server has been launched");
});
