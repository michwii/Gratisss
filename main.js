var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var md5 = require('MD5');
var qsync = require('async');
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
	
	if(emailToSave != undefined && passwordToSave != undefined && login != undefined && utils.validateEmail(emailToSave)){
		var userToCreate = {email: emailToSave, password: md5(passwordToSave), login: loginToSave};

		userService.verifyIfEmailAlreadyExist(emailToSave,function(err, result){
			if(result){
				returnedMessage.sucess = "ko";
				returnedMessage.message = "L'adresse email rensigne est deja utilise";
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
		/*async.series([
			function(){
				userService.verifyIfEmailAlreadyExist(emailToSave,function(err, result){
			}
		]);
		*/

	}else{//we then return an exception
		returnedMessage.success = "ko";
		returnedMessage.message = "Les parametres fournits en entree ne sont pas corrects ou imcomplets"
		res.end(JSON.stringify(returnedMessage));
	}	
});

app.post('/api/users/connexion', function (req, res) {
	res.setHeader('Content-Type', 'application/json');

	var session = req.session;
	var email = req.body.email;
	var password = req.body.password;
	
	userService.getOneUser({email:email, password:md5(password)}, function(err, result){
	
		if(err || result == null){
			var errorJustification = new Object();
			errorJustification.success = "ko";
			errorJustification.message = "Le login ou le mot de passe sont incorrects"
			res.end(JSON.stringify(errorJustification));
		}else{
			var returnedMessage = new Object();
			returnedMessage.success = "ok";
			returnedMessage.userConnected = result;
			session.user = result;
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

	res.render(__dirname + '/views/connexion.ejs', {error : null, user: userConnected});
});


var server = app.listen(80, function(){
	console.log("The server has been launched");
});
