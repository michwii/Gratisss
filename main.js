var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var userService = require(__dirname + '/services/users.js');
var md5 = require('md5');
var utils = require(__dirname + '/services/utils.js');


app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.render(__dirname + '/views/index.ejs');
});

app.get('/users', function (req, res) {
	userService.getAllUsers(null, function(err, result){
		res.end(JSON.stringify(result));
	});
});

app.post('/users', function (req, res) {

	var emailToSave = req.body.email;
	var passwordToSave = req.body.password;
	
	if(emailToSave != undefined && passwordToSave != undefined && utils.validateEmail(emailToSave)){
		var userToCreate = {email: emailToSave, password: md5(passwordToSave)};
		userService.insertUser(userToCreate, function(err, result){
			var returnedMessage = new Object();
			returnedMessage.sucess = "ok";
			returnedMessage.userCreated = userToCreate;
			res.end(JSON.stringify(err));
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

var server = app.listen(80, function(){
	console.log("The server has been launched");
});
