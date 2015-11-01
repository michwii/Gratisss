var md5 = require('md5');
var async = require('async');
var multer = require("multer");
var mkdirp = require('mkdirp');//Sert a creer tout les sous repertoires necessaire. On l'utilise pour enregistrer un ulpoad avec comme sous folder la date du jour
var fs = require("fs"); //Sert a supprime les old profiles pictures quand le mec change de photo
var express = require("express");
var userRoute = express.Router();//On gere les route avec

var utils = require(__dirname + '/../services/utils.js');
var userService = require(__dirname + '/../services/users.js');
var echantillonService = require(__dirname + '/../services/echantillon.js');

var customStorage = multer.diskStorage({
	destination: function (req, file, callback) {
		var currentDate = new Date();
		var currentMonth = currentDate.getMonth()+1;
		var currentDay = currentDate.getDate();
		var finalDestinationUpload = './public/img/uploads/profiles/' + currentDay + '/' + currentMonth;
		
		mkdirp.sync(finalDestinationUpload);//On creer toutes les sous directory necessaire
		callback(null, finalDestinationUpload);
	},
	filename: function (req, file, callback) {
		var login = "";
		if(req.body.login){
			login = decodeURIComponent(req.body.login);
		}
		var finalFileName = login + '-' + Date.now();//Normalement la date ne sert a rien mais on sait jamais je la met pour vraiment differencier tous les fichiers de maniere unique
		callback(null, finalFileName)
	}
});
var uploadMiddleware= multer({
	//dest: './public/img/uploads/profils', 
	storage: customStorage, 
	rename: function (fieldname, filename) {
		return filename.replace(/\W+/g, '-').toLowerCase();
	},
	changeDest: function(dest, req, res) {//Dans cette fonction on va generer le dossier de destination en fonction de la date du jour. 
		var currentDate = new Date();
		var currentMonth = currentDate.getMonth()+1;
		var currentDay = currentDate.getDate();
		var finalDestinationUpload = dest + '/' + currentDay + '/' + currentMonth;
				
		mkdirp.sync(finalDestinationUpload);//On creer toutes les sous directory necessaire
		return finalDestinationUpload;
	}
});

userRoute.get('/api/users', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	userService.getAllUsers(null, function(err, result){
		res.end(JSON.stringify(result));
	});
});

userRoute.get('/api/users/:id', function (req, res) {
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

userRoute.delete('/api/users/:id', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	var id = req.params.id;

	var session = req.session;
	var userConnected = session.user;

	var returnedMessage = new Object();
	if(userConnected && userConnected._id == id){
		//On a besoin de recuperer l'utilisateur qui fait la requete de suppression pour pouvoir avoir l'adresse de sa photo de profile
		//On ne peut pas utiliser l'tilisateur present en session car bientot des roles seront utiliser pour gerer les permissions et un admin poura etre l'utilisateur courant.
		userService.getOneUser({_id:id}, function(err, userToDelete){
			fs.unlink("./public"+userToDelete.profilePicture, function(err, result){})//We do not need to monitor if the request endedup well
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
		});



	}else{
		res.statusCode = 403;
		returnedMessage.success = "ko";
		returnedMessage.message = "Vous n'etes pas authorise a supprime cet utilisateur";
		res.end(JSON.stringify(returnedMessage));
	}


});

userRoute.put('/api/users/:id', uploadMiddleware.single("profilePicture"), function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	var id = req.params.id;
	var newValues = req.body;
	var profilePicture = req.file;

	var session = req.session;
	var userConnected = session.user;

	if(newValues.password){//Dans le cas ou le mec cherche a changer son mot de passe on le crypte avant de le sauver dans la datebase.
		newValues.password = md5(newValues.password);
	}
	if(userConnected && userConnected._id == id){//On verify que c'est bien l'utilisateur courant qui modifie son compte

		//Dans le cas ou le mec a specifie une photo de profil dans son update
		if(profilePicture){
			profilePicture.path = profilePicture.path.replace('public', "").replace(/\\/g, '/');
			newValues.profilePicture = profilePicture.path;
		}

		//On recupere maintenant l'ancienne valeur de l'url de photo de profil
		userService.getOneUser({_id:id}, function(err, userBeforeUpdate){
			if(err){
				res.statusCode = 501;
				returnedMessage.success = "ko";
				returnedMessage.message = "L'utilisateur n'a pas ete modifie pour erreur technique";
				res.end(JSON.stringify(returnedMessage));
			}else{
				var oldProfilePicture = userBeforeUpdate.profilePicture;
				userService.modifyUser({_id:id}, newValues, function(err, result){
					var returnedMessage = new Object();
					if(err){
						res.statusCode = 404;
						returnedMessage.success = "ko";
						returnedMessage.message = "L'utilisateur n'a pas ete modifie";
					}else{
						returnedMessage.success = "ok";
						returnedMessage.user = result;

						//Success == ok donc on peut supprimer l'ancienne photo de profil du file system
						if(oldProfilePicture != "/img/uploads/profiles/defaultProfilePicture.png"){
							fs.unlink("./public"+oldProfilePicture, function(err, result){});//Pas besoin d'attendre la reponse
						}
					}
					res.end(JSON.stringify(returnedMessage));
				});
			}
		});
	}else{
		var returnedMessage = new Object();
		res.statusCode = 403;
		returnedMessage.success = "ko";
		returnedMessage.message = "Vous n'avez pas le droit de modifier le profil d'un autre utilisateur";
		res.end(JSON.stringify(returnedMessage));
	}
});

userRoute.post('/api/users', uploadMiddleware.single("profilePicture"), function (req, res) {

	res.setHeader('Content-Type', 'application/json');

	//On utilise le decode URI component car il semblerait que multer ne le fasse pas automatiquement
	//Attention quand le decodeURIComponent prend en parametre undefined la valeur est transforme en autre chose que undefined
	var emailToSave = (req.body.email) ? decodeURIComponent(req.body.email) : undefined;
	var passwordToSave = (req.body.password) ? decodeURIComponent(req.body.password) : undefined;
	var loginToSave = (req.body.login) ? decodeURIComponent(req.body.login) : undefined;
	var profilePicture = req.file ;//Si le mec creer son compte de maniere manuel pas de file est passe donc ca vaudra undefined
	var session = req.session;
	var returnedMessage = new Object();

	if(emailToSave != undefined && passwordToSave != undefined && loginToSave != undefined && utils.validateEmail(emailToSave)){
		var userToCreate = {email: emailToSave, password: md5(passwordToSave), login: loginToSave};
		if(profilePicture){
			profilePicture.path = profilePicture.path.replace('public', "").replace(/\\/g, '/');
			userToCreate.profilePicture = profilePicture.path;
		}

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

userRoute.post('/api/users/connexion', function (req, res) {
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

userRoute.get('/users/:id', function(req, res){
	var session = req.session;
	var userConnected = session.user;
	var id = req.params.id;
	if(userConnected != null && userConnected._id == id){

		//On va chercher la derniere version de l'user dans le cas ou dans la requete precedente on la mit a jour et que celui present dans la requete ne soit plus a jour.
		userService.getOneUser({_id:id}, function(err, userInfo){
			if(err){
				res.statusCode = 501;
				res.render(__dirname + '/../views/technicalError.ejs', {user: userInfo, mostViewedEchantillons: req.mostViewedEchantillons});
			}else{
				res.render(__dirname + '/../views/users.ejs', {user: userInfo, mostViewedEchantillons: req.mostViewedEchantillons});
			}
		});
	}else{
		res.statusCode = 403;
		res.render(__dirname + '/../views/unAuthorized.ejs', {user: userConnected, mostViewedEchantillons: req.mostViewedEchantillons});
	}
});

userRoute.get('/inscription', function (req, res) {
	var session = req.session;
	var userConnected = session.user;
	res.render(__dirname + '/../views/inscription.ejs', {user: userConnected, mostViewedEchantillons: req.mostViewedEchantillons});
});

userRoute.get('/connexion', function (req, res) {
	var session = req.session;
	var userConnected = session.user;

	res.render(__dirname + '/../views/connexion.ejs', {user: userConnected, mostViewedEchantillons: req.mostViewedEchantillons});
});

userRoute.get('/deconnexion', function (req, res) {
	req.session.destroy();
	res.redirect("/");
});

module.exports = userRoute;