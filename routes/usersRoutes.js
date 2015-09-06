var utils = require(__dirname + '/../services/utils.js');
var userService = require(__dirname + '/../services/users.js');
var md5 = require('md5');
var async = require('async');
var echantillonService = require(__dirname + '/../services/echantillon.js');

exports.initRoute = function(app){
	app.get('/api/users', function (req, res) {
		res.setHeader('Content-Type', 'application/json');
		userService.getAllUsers(null, function(err, result){
			res.end(JSON.stringify(result));
		});
	});
	
	app.get('/api/users/:id', function (req, res) {
		res.setHeader('Content-Type', 'application/json');
		var id = req.params.id;
		userService.getOneUser({_id:id}, function(err, result){
			
			var returnedMessage = new Object();
			if(err){
				res.statusCode = 501;
				returnedMessage.success = "ko";
				returnedMessage.message = "Erreur technique";
			}else{
				if(result == null){
					res.statusCode = 404;
					returnedMessage.success = "ko";
					returnedMessage.message = "L'utilisateur n'existe pas";
				}else{
					returnedMessage.success = "ok";
					returnedMessage.user = result;
				}
			}
			res.end(JSON.stringify(returnedMessage));
		});
	});

	app.delete('/api/users/:id', function (req, res) {
		res.setHeader('Content-Type', 'application/json');
		var id = req.params.id;
		
		var session = req.session;
		var userConnected = session.user;
		
		var returnedMessage = new Object();
		if(userConnected && userConnected._id == id){
			userService.delete(id, function(err){
				if(err){
					res.statusCode = 404;
					returnedMessage.success = "ko";
					returnedMessage.message = "L'utilisateur n'a pas ete supprime";
				}else{
					returnedMessage.success = "ok";
					returnedMessage.message = "L'utilisateur a ete supprime correctement";
				}
			
				res.end(JSON.stringify(returnedMessage));
			});
		}else{
			res.statusCode = 403;
			returnedMessage.success = "ko";
			returnedMessage.message = "Vous n'etes pas authorise a supprime cet utilisateur";
			res.end(JSON.stringify(returnedMessage));
		}
		
		
	});
	
	app.put('/api/users/:id', function (req, res) {
		res.setHeader('Content-Type', 'application/json');
		var id = req.params.id;
		var newValues = req.body;
		
		var session = req.session;
		var userConnected = session.user;
		
		if(newValues.password){//Dans le cas ou le mec cherche a changer son mot de passe on le crypte avant de le sauver dans la datebase.
			newValues.password = md5(newValues.password);
		}
		if(userConnected && userConnected._id == id){//On verify que c'est bien l'utilisateur courant qui modifie son compte
			userService.modifyUser({_id:id}, newValues, function(err, result){
				var returnedMessage = new Object();
				if(err){
					res.statusCode = 404;
					returnedMessage.success = "ko";
					returnedMessage.message = "L'utilisateur n'a pas ete modifie";
				}else{
					returnedMessage.success = "ok";
					returnedMessage.user = result;
				}
				res.end(JSON.stringify(returnedMessage));
			});
		}else{
			var returnedMessage = new Object();
			res.statusCode = 403;
			returnedMessage.success = "ko";
			returnedMessage.message = "Vous n'avez pas le droit de modifier le profil d'un autre utilisateur";
			res.end(JSON.stringify(returnedMessage));
		}
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
			//On met undefined dans le deuxieme parametre (qui correspond a l'id pour dire que c'est un nouveau user et donc forcement il a pas d'id.
			var emailBindFunction = userService.emailAlreadyExist.bind(undefined, undefined, emailToSave);
			var loginBindFunction = userService.loginAlreadyExist.bind(undefined, undefined, loginToSave);
			async.parallel([emailBindFunction, loginBindFunction], function(err, result){
				if(err || result[0] || result[1]){
					res.statusCode = 501;
					returnedMessage.success = "ko";
					returnedMessage.message = "L'adresse email ou le login rensigne est deja utilise";
					res.end(JSON.stringify(returnedMessage));
				}else{
					userService.insertUser(userToCreate, function(err, result){
						var returnedMessage = new Object();
						returnedMessage.success = "ok";
						returnedMessage.userCreated = result;
						session.user = result;
						res.end(JSON.stringify(returnedMessage));
					});
				}
				
			});

		}else{//we then return an exception
			res.statusCode = 501;
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
				res.statusCode = 403;
				returnedMessage.success = "ko";
				returnedMessage.message = "Le login ou le mot de passe sont incorrects"
			}else{
				returnedMessage.success = "ok";
				returnedMessage.userConnected = result;
				req.session.user = result;
			}
			res.end(JSON.stringify(returnedMessage));
		});
	});
	
	app.get('/users/:id', function(req, res){
		var session = req.session;
		var userConnected = session.user;
		var id = req.params.id;
		if(userConnected != null && userConnected._id == id){
		
			//On va chercher la derniere version de l'user dans le cas ou dans la requete precedente on la mit a jour et que celui present dans la requete ne soit plus a jour.
			userService.getOneUser({_id:id}, function(err, userInfo){
				if(err){
					res.statusCode = 501;
					res.render(__dirname + '/../views/technicalError.ejs');				
				}else{
					res.render(__dirname + '/../views/users.ejs', {user: userInfo, mostViewedEchantillons: req.mostViewedEchantillons});		
				}
			});
		}else{
			res.statusCode = 403;
			res.render(__dirname + '/../views/unAuthorized.ejs');	
		}
	});
	
	app.get('/inscription', function (req, res) {
		var session = req.session;
		var userConnected = session.user;
		res.render(__dirname + '/../views/inscription.ejs', {user: userConnected, mostViewedEchantillons: req.mostViewedEchantillons});
	});

	app.get('/connexion', function (req, res) {
		var session = req.session;
		var userConnected = session.user;

		res.render(__dirname + '/../views/connexion.ejs', {user: userConnected, mostViewedEchantillons: req.mostViewedEchantillons});
	});

	app.get('/deconnexion', function (req, res) {
		req.session.destroy();
		res.redirect("/");
	});

};