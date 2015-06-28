var request = require("request");


exports.homePage = function(test){
	request.get("http://localhost/", function(err, response, body){
		test.equal(err, undefined, "Erreur Technique dans la home page "+ err);
		var statusCode = response.statusCode;
		test.equal(statusCode, 200);
		test.done();
	});
};

exports.echantillonsGratuis = function(test){
	request.get("http://localhost/echantillons-gratuits", function(err, response, body){
		test.equal(err, undefined, "Erreur Technique dans la echantillons-gratuits page "+ err);
		var statusCode = response.statusCode;
		test.equal(statusCode, 200);
		test.done();
	});
};

exports.bonsReduction = function(test){
	request.get("http://localhost/bons-de-reduction", function(err, response, body){
		test.equal(err, undefined, "Erreur Technique dans la bons-de-reduction page "+ err);
		var statusCode = response.statusCode;
		test.equal(statusCode, 200);
		test.done();
	});
};

exports.codesReduction = function(test){
	request.get("http://localhost/codes-de-reduction", function(err, response, body){
		test.equal(err, undefined, "Erreur Technique dans la codes-de-reduction page "+ err);
		var statusCode = response.statusCode;
		test.equal(statusCode, 200);
		test.done();
	});
};


exports.pointsFidelite = function(test){
	request.get("http://localhost/points-de-fidelite", function(err, response, body){
		test.equal(err, undefined, "Erreur Technique dans la points-de-fidelite page "+ err);
		var statusCode = response.statusCode;
		test.equal(statusCode, 200);
		test.done();
	});
};

exports.inscription = function(test){
	request.get("http://localhost/inscription", function(err, response, body){
		test.equal(err, undefined, "Erreur Technique dans la inscription page "+ err);
		var statusCode = response.statusCode;
		test.equal(statusCode, 200);
		test.done();
	});
};

exports.connexion = function(test){
	request.get("http://localhost/connexion", function(err, response, body){
		test.equal(err, undefined, "Erreur Technique dans la connexion page "+ err);
		var statusCode = response.statusCode;
		test.equal(statusCode, 200);
		test.done();
	});
};