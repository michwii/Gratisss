var echantillonService = require(__dirname + '/../services/echantillon');
var utils = require(__dirname + '/../services/utils');

exports.initRoute = function(app){
	
	app.get('/echantillons-gratuits', function (req, res) {
		var session = req.session;
		var userConnected = session.user;
		res.render(__dirname + '/../views/coming-soon.ejs', {user: userConnected});
	});
	
	app.get('/echantillons-gratuits/:title/:id', function (req, res) {
		var session = req.session;
		var userConnected = session.user;
		
		var id = req.params.id;
		
		echantillonService.getOneEchantillon({_id:id}, function(err, result){
			res.render(__dirname + '/../views/echantillon.ejs', {user: userConnected, echantillon: result});		
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
	
	/*
	app.get('/api/codes-de-reduction', function(req, res){
		res.setHeader('Content-Type', 'application/json');
		
		codesReductionService.getAllCodesReduction(null, function(err, result){
			res.end(JSON.stringify({success: "ok", codesReduction: result}));
		});
	});
	
	app.get('/api/codes-de-reduction/:brand/:id', function(req, res){
		res.setHeader('Content-Type', 'application/json');
		var id = req.params.id;		
		var brand = utils.transformUrlInBrandName(req.params.brand);
		codesReductionService.getOneCodeReduction({_id:id, brand: brand}, function(err, result){
			if(err){
				res.statusCode = 501;
				res.end(JSON.stringify({success: "ko", message:"Le code de reduction n'a pas pu etre enregistre"}));
			}else if(result.length == 0){
				res.statusCode = 404;
				res.end(JSON.stringify({success: "ko", message:"Le code de reduction demande n'existe pas"}));
			}else{
				res.end(JSON.stringify({success: "ok", codeReduction:result}));
			}
		});
	});
	
	app.post('/api/codes-de-reduction', function(req, res){
		res.setHeader('Content-Type', 'application/json');
		
		var brand = req.body.brand;
		var code = req.body.code;
		var url = req.body.url;
		var description = req.body.description;
		var validityStart = req.body.validityStart;
		var validityEnd = req.body.validityEnd;
		var urlLogo = req.body.urlLogo;
		
		codesReductionService.insertCodeReduction({brand:brand, code:code, url:url, urlLogo: urlLogo, description:description, validityStart: validityStart, validityEnd: validityEnd}, function(err, result){
			if(err || result == null){
				res.statusCode = 501;
				res.end(JSON.stringify({success: "ko", message:"Le code de reduction n'a pas pu etre enregistre"}));
			}else{
				res.end(JSON.stringify({success: "ok", codeReduction:result}));
			}
		});
		
	});
	
	
	
	app.delete('/api/codes-de-reduction/:id', function(req, res){
		res.setHeader('Content-Type', 'application/json');
		var id = req.params.id;		
		codesReductionService.deleteCodeReduction(id, function(err){
			if(err){
				res.statusCode = 501;
				res.end(JSON.stringify({success: "ko", message:"Le code de reduction n'a pas pu etre supprime"}));
			}else{
				res.end(JSON.stringify({success: "ok", message:"Le code de reduction a ete supprime"}));
			}
		});
	});
	
	app.get('/codes-de-reduction', function(req, res){
		var session = req.session;
		var userConnected = session.user;
		codesReductionService.getAllCodesReduction(null, function(err, result){
			res.render(__dirname + '/../views/codesReduction.ejs', {user: userConnected, codesReduction: result});
		});
	});
	
	*/
};