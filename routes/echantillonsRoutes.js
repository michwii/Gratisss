var async = require("async");
var multer = require("multer");
var mkdirp = require('mkdirp');//Sert a creer tout les sous repertoires necessaire. On l'utilise pour enregistrer un ulpoad avec comme sous folder la date du jour
var express = require('express');
var echantillonRoute = express.Router();//On gere les route avec

var echantillonService = require(__dirname + '/../services/echantillon');
var utils = require(__dirname + '/../services/utils');


	
var customStorage = multer.diskStorage({
	destination: function (req, file, callback) {
		var currentDate = new Date();
		var currentMonth = currentDate.getMonth()+1;
		var currentDay = currentDate.getDate();
		var finalDestinationUpload = './public/img/uploads/echantillons/' + currentDay + '/' + currentMonth;

		mkdirp.sync(finalDestinationUpload);//On creer toutes les sous directory necessaire
		callback(null, finalDestinationUpload);
	},
	filename: function (req, file, callback) {
		var echantillonTitle = "DefaultName";
		if(req.body.title){
			echantillonTitle = req.body.title;
		}
		var imageExtension = file.originalname.split('.').pop();
		var finalFileName = echantillonTitle + '-' + Date.now() + "." + imageExtension;//Normalement la date ne sert a rien mais on sait jamais je la met pour vraiment differencier tous les fichiers de maniere unique
		callback(null, finalFileName)
	}
});
var uploadMiddleware= multer({
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

echantillonRoute.get('/echantillons-gratuits', function (req, res) {
	var session = req.session;
	var userConnected = session.user;

	echantillonService.getAllEchantillons({validated : true}, function(err, result){
		res.render(__dirname + '/../views/echantillons-gratuits.ejs', {user: userConnected, echantillons: result, mostViewedEchantillons: req.mostViewedEchantillons });
	});

});

echantillonRoute.get('/echantillons-gratuits/:urlClean/:id', function (req, res) {
	var session = req.session;
	var userConnected = session.user;

	var id = req.params.id;
	var urlClean = req.params.urlClean;

	async.parallel([
		echantillonService.getOneEchantillon.bind(undefined, {_id:id, urlClean: urlClean}),
		echantillonService.getNewEchantillons
	], function(err, result){

		if(err){
			res.end("Desole une erreur technique s'est produite.");
		}else{

			if(result[0] == null ){//Si l'echantillon chercher vaut null cela veut dire qu'il n'existe pas
				res.end("Desole l'echantillon demande n'existe.");
			}else{
				var echantillonToPrint = result[0];
				var newEchantillons = result[1];
				res.render(__dirname + '/../views/echantillon.ejs', {user: userConnected, echantillon: echantillonToPrint, mostViewedEchantillons:req.mostViewedEchantillons, newEchantillons: newEchantillons });
			}
		}

	});

});

echantillonRoute.get('/api/echantillons-gratuits', function (req, res) {
	res.setHeader('Content-Type', 'application/json');

	echantillonService.getAllEchantillons(null, function(err, result){
		res.end(JSON.stringify({success: "ok", echantillons: result}));
	});
});

echantillonRoute.put('/api/echantillons-gratuits/:id', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	var messageToReturn = {};
	var id = req.params.id;
	var valuesToModidy = req.body;

	echantillonService.modifyOneEchantillon({_id:id}, valuesToModidy, function(err, result){

		if(err){
			res.statusCode = 501;
			messageToReturn.success = "ko";
			messageToReturn.message = "Erreur dans l'update de l'echantillon";
			res.end(JSON.stringify(messageToReturn));
		}else if(result == undefined || result == null){
			res.statusCode = 404;
			messageToReturn.success = "ko";
			messageToReturn.message = "L'echantillon n'a pas ete modifie car non trouve";
			res.end(JSON.stringify(messageToReturn));
		}else{
			messageToReturn.success = "ok";
			messageToReturn.echantillon = result;
			res.end(JSON.stringify(messageToReturn));
		}
	});

});

echantillonRoute.get('/api/echantillons-gratuits/search/most-viewed', function (req, res) {
	res.setHeader('Content-Type', 'application/json');

	res.end(JSON.stringify({success: "ok", echantillons: req.mostViewedEchantillons}));

});

echantillonRoute.get('/api/echantillons-gratuits/search/new', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	echantillonService.getNewEchantillons(function(err, result){
		res.end(JSON.stringify({success: "ok", echantillons: result}));
	});
});

echantillonRoute.get('/api/echantillons-gratuits/search/category/:category', function (req, res) {
	res.setHeader('Content-Type', 'application/json');

	var category = req.params.category;

	echantillonService.getRelatedEchantillons(category, function(err, result){
		res.end(JSON.stringify({success: "ok", echantillons: result}));
	});
});

echantillonRoute.get('/api/echantillons-gratuits/search/:param=:value', function(req, res){
	res.setHeader('Content-Type', 'application/json');

	var param = req.params.param;
	var value = req.params.value;

	var searchQuery = {};
	searchQuery[param] = value;//On a besoin d'utiliser ce petit tric car sinon si on met dans getOneEchantillon direct param : value et bien il chercherait un echantillon qui a comme parametre un parametre qui s'appelle param

	echantillonService.getOneEchantillon(searchQuery, function(err, result){

		var messageToReturn = {};

		if(err){
			res.statusCode = 501;
			messageToReturn.success = "ko";
			messageToReturn.message ="Erreur technique";
			res.end(JSON.stringify(messageToReturn));
		}else if(result == null){
			res.statusCode = 404;
			messageToReturn.success = "ko";
			messageToReturn.message ="Erreur echantillon non trouve";
			res.end(JSON.stringify(messageToReturn));
		}else{
			messageToReturn.success = "ok";
			messageToReturn.echantillon = result;
			res.end(JSON.stringify(messageToReturn));
		}
	});
});

echantillonRoute.delete('/api/echantillons-gratuits/:id', function (req, res) {
	res.setHeader('Content-Type', 'application/json');

	var id = req.params.id;
	var messageToReturn = {};
	echantillonService.deleteEchantillon({_id: id}, function(err, result){
		result = JSON.parse(result);//Car je sais pas pourquoi mais Mongoose te retourne une string plutot qu'un object
		if(err){
			res.statusCode = 501;
			messageToReturn.success = "ko";
			messageToReturn.message = "erreur technique" + err;
			res.end(JSON.stringify(messageToReturn));
		}else if(result == 0){
			res.statusCode = 404;
			messageToReturn.success = "ko";
			messageToReturn.message = "Echantillon non supprime car non trouve";
			res.end(JSON.stringify(messageToReturn));
		}else{
			messageToReturn.success = "ok";
			messageToReturn.message = "Echantillon supprime correctement";
			res.end(JSON.stringify(messageToReturn));
		}

	});

});

echantillonRoute.get('/api/echantillons-gratuits/:id', function (req, res) {
	res.setHeader('Content-Type', 'application/json');

	var id = req.params.id;

	echantillonService.getOneEchantillon({_id: id}, function(err, result){
		var messageToReturn = {};
		if(err){
			res.statusCode = 501;
			messageToReturn.success = "ko";
			messageToReturn.message = "Erreur technique";
			res.end(JSON.stringify(messageToReturn));
		}else if(result == null){
			res.statusCode = 404;
			messageToReturn.success = "ko";
			messageToReturn.message = "Erreur echantillon not found";
			res.end(JSON.stringify(messageToReturn));
		}else{
			messageToReturn.success = "ok";
			messageToReturn.echantillon = result;
			res.end(JSON.stringify(messageToReturn));
		}
	});
});

echantillonRoute.post('/api/echantillons-gratuits', uploadMiddleware.single("echantillonPicture"),function(req, res){
	res.setHeader('Content-Type', 'application/json');

	var echantillonToInsert = req.body;
	var echantillonPicture = req.file ;//On peut soit creer un echantillon avec une photo ou sans
	if(echantillonPicture){
		echantillonToInsert.urlImage = echantillonPicture.path;
		echantillonToInsert.urlImage = echantillonToInsert.urlImage.replace('public', "").replace(/\\/g, '/');
	}
	echantillonService.insertEchantillon(echantillonToInsert, function(err, result){
		var messageToReturn = {};
		if(err){
			res.statusCode = 501;
			messageToReturn.success = "ko";
			messageToReturn.message = err.message;
			res.end(JSON.stringify(messageToReturn));
		}else{
			messageToReturn.success = "ok";
			messageToReturn.echantillon = result;
			res.end(JSON.stringify(messageToReturn));
		}
	});

});

module.exports = echantillonRoute;