

exports.initRoute = function(app){
	app.get('/api/codes-de-reduction', function(req, res){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({test: "ok"}));
	});
};