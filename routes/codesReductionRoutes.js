var codesReductionService = require(__dirname + '/../services/codesReduction');

exports.initRoute = function(app){
	app.get('/api/codes-de-reduction', function(req, res){
		res.setHeader('Content-Type', 'application/json');
		
		codesReductionService.getAllCodesReduction(null, function(err, result){
			res.end(JSON.stringify({success: "ok", codesReduction: result}));
		});
	});
	
	app.post('/api/codes-de-reduction', function(req, res){
		res.setHeader('Content-Type', 'application/json');
		
		var name = req.body.name;
		var brand = req.body.brand;
		var code = req.body.code;
		var url = req.body.url;
		var description = req.body.description;
		
		codesReductionService.insertCodeReduction({name:name, brand:brand, code:code, url:url, description:description}, function(err, result){
			if(err || result == null){
				res.end(JSON.stringify({success: "ko", message:"Le code de reduction n'a pas pu etre enregistre"}));
			}
			res.end(JSON.stringify({success: "ok", codeReduction:result}));
		});
		
	});
};