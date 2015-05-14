var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var userService = require(__dirname + '/services/users.js');


app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


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
	var postData = req.body.text;

	console.log(req.query);
	
	userService.insertUser({email: emailToSave, password: passwordToSave}, function(err, result){
		res.end(JSON.stringify({success: 'ok'}));
	});
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
