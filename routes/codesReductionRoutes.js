var codesReductionService = require(__dirname + '/../services/codesReduction');
var utils = require(__dirname + '/../services/utils');

exports.initRoute = function(app){
	app.get('/api/codes-de-reduction', function(req, res){
		res.setHeader('Content-Type', 'application/json');
		
		codesReductionService.getAllCodesReduction(null, function(err, result){
			res.end(JSON.stringify({success: "ok", codesReduction: result}));
		});
	});
	
	app.get('/api/codes-de-reduction/:id', function(req, res){
		res.setHeader('Content-Type', 'application/json');
		var id = req.params.id;		
		codesReductionService.getOneCodeReduction({_id:id}, function(err, result){
			if(err){
				res.statusCode = 501;
				res.end(JSON.stringify({success: "ko", message:"Le code de reduction n'a pas pu etre recupere"}));
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
};