var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var userService = require(__dirname + '/services/users.js');
var md5 = require('md5');
var utils = require(__dirname + '/services/utils.js');

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
	res.render(__dirname + '/views/index.ejs');
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
		returnedMessage.message = "L'utilisateur a ete supprime corectement";
		res.end(JSON.stringify(returnedMessage));
	});
});

app.post('/api/users', function (req, res) {

	var emailToSave = req.body.email;
	var passwordToSave = req.body.password;
	var session = req.session;
	res.setHeader('Content-Type', 'application/json');
	
	if(emailToSave != undefined && passwordToSave != undefined && utils.validateEmail(emailToSave)){
		var userToCreate = {email: emailToSave, password: md5(passwordToSave)};
		
		userService.verifyIfEmailAlreadyExist(emailToSave,function(err, result){
			if(result){
				var returnedMessage = new Object();
				returnedMessage.sucess = "ko";
				returnedMessage.message = "L'adresse email rensigne est deja utilise";
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
		var errorJustification = new Object();
		errorJustification.success = "ko";
		errorJustification.message = "Les parametres fournits en entree ne sont pas corrects ou imcomplets"
		res.end(JSON.stringify(errorJustification));
	}	
});


app.get('/inscription', function (req, res) {
	res.render(__dirname + '/views/inscription.ejs');
});

app.post('/inscription', function (req, res) {
	var email = req.body.email;
	var password = req.body.password;
	var passwordAgain = req.body.passwordAgain;
	
	if(password == passwordAgain){
		//A ce moment la precis on devrait creer un cookie de session et le renvoyer vers la page d'acceuil
		userService.insertUser({email: email, password: password}, function(err, result){
			res.render(__dirname + '/views/index.ejs');
		});
	}else{
		res.render(__dirname + '/views/inscription.ejs', {error: "Les mots de passe ne sont pas equivalents"});
	}
});

app.get('/connexion', function (req, res) {
	res.render(__dirname + '/views/connexion.ejs', {error : null});
});

app.post('/connexion', function (req, res) {
	var session = req.session;
	var email = req.body.email;
	var password = req.body.password;
	
	userService.getOneUser({email:email, password:md5(password)}, function(err, result){
	
		if(err || result == null){
			res.render(__dirname + '/views/connexion.ejs', {error: "Le login ou le mot de passe sont incorrect"});
		}else{
			session.user = result;
			res.redirect('/');
		}
	});
});

var server = app.listen(80, function(){
	console.log("The server has been launched");
});
