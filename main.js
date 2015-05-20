var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var md5 = require('MD5');
var async = require('async');
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

app.get('/', function (req, res) {
	var session = req.session;
	var userConnected = session.user;
	res.render(__dirname + '/views/index.ejs', {user: userConnected});
});

app.get('/api/users', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	userService.getAllUsers(null, function(err, result){
		res.end(JSON.stringify(result));
	});
});

app.delete('/api/users/:id', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	var id = req.params.id;
	userService.delete(id, function(err){
		var returnedMessage = new Object();
		if(err){
			returnedMessage.sucess = "ko";
			returnedMessage.message = "L'utilisateur n'a pas ete supprime";
		}
	
		returnedMessage.sucess = "ok";
		returnedMessage.message = "L'utilisateur a ete supprime correctement";
		res.end(JSON.stringify(returnedMessage));
	});
});

app.post('/api/users', function (req, res) {

	res.setHeader('Content-Type', 'application/json');

	var emailToSave = req.body.email;
	var passwordToSave = req.body.password;
	var loginToSave = req.body.login;
	var session = req.session;
	var returnedMessage = new Object();
	
	if(emailToSave != undefined && passwordToSave != undefined && loginToSave != undefined && utils.validateEmail(emailToSave)){
		var userToCreate = {email: emailToSave, password: md5(passwordToSave), login: loginToSave};
/*
		userService.verifyIfEmailAlreadyExist(emailToSave,function(err, result){
			if(result){
				returnedMessage.sucess = "ko";
				returnedMessage.message = "L'adresse email ou le login rensigne est deja utilise";
				res.end(JSON.stringify(returnedMessage));
				return;//Pas besoin d'aller plus loin
			}else{
				//On verifie maintenant que le login n'est pas deja present
				userService.insertUser(userToCreate, function(err, result){
					var returnedMessage = new Object();
					returnedMessage.sucess = "ok";
					returnedMessage.userCreated = result;
					session.user = result;
					res.end(JSON.stringify(returnedMessage));
				});
			}
			
			res.end(JSON.stringify(returnedMessage));
		});
		*/
		var emailBindFunction = userService.emailAlreadyExist.bind(undefined, emailToSave);
		var loginBindFunction = userService.loginAlreadyExist.bind(undefined, loginToSave);
		async.parallel([emailBindFunction, loginBindFunction], function(err, result){
			if(err || result[0] || result[1]){
				returnedMessage.success = "ko";
				returnedMessage.message = "L'adresse email ou le login rensigne est deja utilise";
				res.end(JSON.stringify(returnedMessage));
			}else{
				userService.insertUser(userToCreate, function(err, result){
					var returnedMessage = new Object();
					returnedMessage.sucess = "ok";
					returnedMessage.userCreated = result;
					session.user = result;
					res.end(JSON.stringify(returnedMessage));
				});
			}
			
		});

	}else{//we then return an exception
		returnedMessage.success = "ko";
		returnedMessage.message = "Les parametres fournits en entree ne sont pas corrects ou imcomplets"
		res.end(JSON.stringify(returnedMessage));
	}	
});

app.post('/api/users/connexion', function (req, res) {
	res.setHeader('Content-Type', 'application/json');

	var email = req.body.email;
	var password = req.body.password;
	
	userService.getOneUser({email: email, password:md5(password)}, function(err, result){
		var returnedMessage = new Object();

		if(err || result == null){
			returnedMessage.success = "ko";
			returnedMessage.message = "Le login ou le mot de passe sont incorrects"
			res.end(JSON.stringify(returnedMessage));
		}else{
			returnedMessage.success = "ok";
			returnedMessage.userConnected = result;
			req.session.user = result;
			res.end(JSON.stringify(returnedMessage));
		}
	});
});


app.get('/inscription', function (req, res) {
	var session = req.session;
	var userConnected = session.user;

	res.render(__dirname + '/views/inscription.ejs', {user: userConnected});
});

app.get('/connexion', function (req, res) {
	var session = req.session;
	var userConnected = session.user;

	res.render(__dirname + '/views/connexion.ejs', {user: userConnected});
});


var server = app.listen(80, function(){
	console.log("The server has been launched");
});
