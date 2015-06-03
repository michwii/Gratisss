var codesReductionService = require(__dirname + "/../services/codesReduction");
var utils = require(__dirname + "/../services/utils")
var async = require('async');
var request = require('request');

var arrayOfCodesReductionInserted = new Array();
for(var i = 0; i < 10; i++){
	var codeToInsert = {
		brand: "Brand"+i,
		code: "Code"+i, 
		description: "Description"+i, 
		url: "http://url"+i,
		urlLogo: "http://urlLogo"+i,
		validityStart: "10/10/2015",
		validityEnd: "10/10/2016"
	};
	arrayOfCodesReductionInserted.push(codeToInsert);
}

exports.insertCodeReduction = function(test){
	
	var arrayOfRequestPostBinded = new Array();
	for(var i = 0; i< 10; i++){
		var requestPostBinded = request.post.bind(undefined, {url:"http://localhost/api/codes-de-reduction", form: arrayOfCodesReductionInserted[i]});
		arrayOfRequestPostBinded.push(requestPostBinded);
	}
	async.series(arrayOfRequestPostBinded, function(error, response){
		test.equal(error, null, "Erreur lors de l'insertion d'un CodeDeReduction");
		for(var i = 0; i< 10; i++){
			var responseParsed = JSON.parse(response[i][0].body);
			test.equal(responseParsed.success, "ok", "L'insertion ne sait pas passe correctement");
			arrayOfCodesReductionInserted[i]._id = responseParsed.codeReduction._id;
		}
		test.done();
	});
};

exports.getAllCodesReductionAndTestThem = function(test){
	
	request.get("http://localhost/api/codes-de-reduction", function(err, response, body){
		test.equal(err, null, "Erreur dans le getAll");
		var arrayOfRequestGetBinded = new Array();
		var parsedResponse = JSON.parse(body).codesReduction;
		for(var i = 0; i< parsedResponse.length; i++){
			var id = parsedResponse[i]._id;
			test.notEqual(id, undefined, "Erreur dans le getAll. ID = undefined");
			var requestGetBinded = request.get.bind(undefined, "http://localhost/api/codes-de-reduction/"+id);
			arrayOfRequestGetBinded.push(requestGetBinded);
		}

		async.series(arrayOfRequestGetBinded, function(err, result){
			test.equal(err, null, "Erreur dans le getAll");
			for(var i = 0; i< result.length; i++){
				var responseParsed = JSON.parse(result[i][0].body);
				test.equal(responseParsed.success, "ok","Erreur dans le getAll GetAllCodesReduction. Le success n'est pas egal a ok ");
			}
			test.done();
		});
		
		
	});
}

exports.delete = function(test){
	var arrayOfRequestDeleteBinded = new Array();
	for(var i = 0; i< 10; i++){
		var requestDeleteBinded = request.del.bind(undefined, "http://localhost/api/codes-de-reduction/"+arrayOfCodesReductionInserted[i]._id);
		arrayOfRequestDeleteBinded.push(requestDeleteBinded);
	}
	async.series(arrayOfRequestDeleteBinded, function(error, response){
		test.equal(error, null, "Erreur lors de l'insertion d'un CodeDeReduction");
		for(var i = 0; i< 10; i++){
			var responseParsed = JSON.parse(response[i][0].body);
			test.equal(responseParsed.success, "ok", "La suppression ne sait pas passe correctement");
		}
		test.done();
	});
};