var async = require("async");
var echantillonService = require(__dirname + '/../services/echantillon');
var utils = require(__dirname + '/../services/utils');

exports.initRoute = function(app){
	
	app.get('/echantillons-gratuits', function (req, res) {
		var session = req.session;
		var userConnected = session.user;
		
		echantillonService.getAllEchantillons({validated : true}, function(err, result){
			res.render(__dirname + '/../views/echantillons-gratuits.ejs', {user: userConnected, echantillons : result});
		});
	});
	
	app.get('/echantillons-gratuits/:title/:id', function (req, res) {
		var session = req.session;
		var userConnected = session.user;
		
		var id = req.params.id;
		
		async.parallel([
			echantillonService.getOneEchantillon.bind(undefined, {_id:id}),
			echantillonService.getMostViewedEchantillons,
			echantillonService.getNewEchantillons
		], function(err, result){
			res.render(__dirname + '/../views/echantillon.ejs', {user: userConnected, echantillon: result[0], mostViewedEchantillons: result[1], newEchantillons: result[2] });				
		});
				
	});

	app.get('/api/echantillons-gratuits', function (req, res) {
		res.setHeader('Content-Type', 'application/json');

		echantillonService.getAllEchantillons(null, function(err, result){
			res.end(JSON.stringify({success: "ok", echantillons: result}));
		});
	});
	
	app.put('/api/echantillons-gratuits/:id', function (req, res) {
		res.setHeader('Content-Type', 'application/json');
		var messageToReturn = {};
		var id = req.params.id;
		var valuesToModidy = req.body;
		
		echantillonService.modifyEchantillon(id, valuesToModidy, function(err, result){
			if(err){
				res.statusCode(501);
				messageToReturn.success = "ko";
				messageToReturn.message = "Erreur dans l'update de l'echantillon";
				res.end(JSON.stringify(messageToReturn));
			}else{
				messageToReturn.success = "ok";
				messageToReturn.echantillon = result;
				res.end(JSON.stringify(messageToReturn));

			}
		});
		
	});
	
	app.get('/api/echantillons-gratuits/search/most-viewed', function (req, res) {
		res.setHeader('Content-Type', 'application/json');
		echantillonService.getMostViewedEchantillons(function(err, result){
			res.end(JSON.stringify({success: "ok", echantillons: result}));
		});
	});
	
	app.get('/api/echantillons-gratuits/search/new', function (req, res) {
		res.setHeader('Content-Type', 'application/json');
		echantillonService.getNewEchantillons(function(err, result){
			res.end(JSON.stringify({success: "ok", echantillons: result}));
		});
	});
	
	app.get('/api/echantillons-gratuits/search/category/:category', function (req, res) {
		res.setHeader('Content-Type', 'application/json');
		
		var category = req.params.category;
		
		echantillonService.getRelatedEchantillons(category, function(err, result){
			res.end(JSON.stringify({success: "ok", echantillons: result}));
		});
	});
	
	app.get('/api/echantillons-gratuits/search/:source', function(req, res){
		res.setHeader('Content-Type', 'application/json');

		var source = req.params.source;
		echantillonService.getOneEchantillon({source:source}, function(err, result){
		
			var messageToReturn = {};
		
			if(err){
				messageToReturn.success = "ko";
				messageToReturn.message("Erreur dans la presence de l'echantillon");
				res.end(messageToReturn);
			}else{
				messageToReturn.success = "ok";
				messageToReturn.echantillonPresent = (result == null) ? false : true;
				messageToReturn.echantillon = result;
				res.end(JSON.stringify(messageToReturn));
			}
		});
	});
	
	app.delete('/api/echantillons-gratuits/:id', function (req, res) {
		res.setHeader('Content-Type', 'application/json');

		var id = req.params.id;
		echantillonService.deleteEchantillon({_id: id}, function(err, result){
			res.end(JSON.stringify({success: "ok", echantillon: result}));
		});
		
	});
	
	app.get('/api/echantillons-gratuits/:id', function (req, res) {
		res.setHeader('Content-Type', 'application/json');

		var id = req.params.id;
		echantillonService.getOneEchantillon({_id: id}, function(err, result){
			res.end(JSON.stringify({success: "ok", echantillon: result}));
		});
	});
	
	app.post('/api/echantillons-gratuits', function(req, res){
		res.setHeader('Content-Type', 'application/json');
		
		var echantillonToInsert = req.body;
			
		echantillonService.insertEchantillon(echantillonToInsert, function(err, result){
			res.end(JSON.stringify({success: "ok", echantillon: result}));
		});
		
	});
};