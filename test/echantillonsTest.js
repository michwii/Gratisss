var async = require('async');
var request = require('request');
var echantillonService = require(__dirname + "/../services/echantillon");
var utils = require(__dirname + "/../services/utils");

var arrayOfEchantillonInserted = new Array();


for(var i = 0; i < 10; i++){
	var echantillonToInsert = {
		title: "Title avec des espaces et des acceents éééé 'et des guillemets \" ohhh  \" "+i,
		description: "Description"+i, 
		url: "http://www.urlthatdoesntexist.com",
		urlImage: "http://www.urlthatdoesntexist.com",
		author: "UnitTest"+i,
		source: "http://www.sourcethatdoesntexist.com",
		category: "Bebe"
	};
	arrayOfEchantillonInserted.push(echantillonToInsert);
}

exports.insertEchantillons = function(test){
	arrayOfBindPostRequest = new Array();
	for(var i = 0; i < arrayOfEchantillonInserted.length; i++){
		arrayOfBindPostRequest.push(request.post.bind(undefined, {url : "http://localhost/api/echantillons-gratuits", form : arrayOfEchantillonInserted[i]}));
	};
	
	async.parallel(arrayOfBindPostRequest, function(err, results){
		test.equal(err, undefined, "Erreur dans l'insertion des echantillons (erreur technique)" + err);
		for(var i = 0; i < arrayOfEchantillonInserted.length; i++){
			var body = JSON.parse(results[i][0].body);
			test.equal(body.success, "ok", "Success n'est pas egal a ok dans l'insert d'un echantillon");
			test.notEqual(body.echantillon, null, "La reponse du insert ne contient pas un echantillon");
			test.notEqual(body.echantillon, undefined, "La reponse du insert ne contient pas un echantillon");
			test.equal(typeof body.echantillon._id, typeof 0, "L'id retourne dans l'insert n'est pas un nombre");
			test.equal(body.echantillon.title, arrayOfEchantillonInserted[i].title, "Title pas egal");
			test.equal(body.echantillon.description, arrayOfEchantillonInserted[i].description, "Description pas egal");
			test.equal(body.echantillon.url, arrayOfEchantillonInserted[i].url, "url pas egal");
			test.equal(body.echantillon.urlImage, arrayOfEchantillonInserted[i].urlImage, "urlImage pas egal");
			test.equal(body.echantillon.source, arrayOfEchantillonInserted[i].source, "Source pas egal");
			test.equal(body.echantillon.author, arrayOfEchantillonInserted[i].author, "Author pas egal");
			arrayOfEchantillonInserted[i]._id = body.echantillon._id;//On set l'id pour pouvoir s'en reservir dans la suppression et le modify
		}
		test.done();
	});
};

exports.getEchantillonsThatHaveBeenInserted = function(test){
	arrayOfBindGetRequest = new Array();
	for(var i = 0; i < arrayOfEchantillonInserted.length; i++){
		arrayOfBindGetRequest.push(request.get.bind(undefined, "http://localhost/api/echantillons-gratuits/"+arrayOfEchantillonInserted[i]._id));
	}
	async.parallel(arrayOfBindGetRequest, function(err, results){
		test.equal(err, undefined, "Erreur dans le get des echantillons (erreur technique)" + err);
		for(var i = 0; i < arrayOfEchantillonInserted.length; i++){
			var body = JSON.parse(results[i][0].body);
			test.equal(body.success, "ok", "Success n'est pas egal a ok dans le get d'un echantillon");
			test.notEqual(body.echantillon, null, "La reponse du insert ne contient pas un echantillon");
			test.notEqual(body.echantillon, undefined, "La reponse du insert ne contient pas un echantillon");
			test.equal(typeof body.echantillon._id, typeof 0, "L'id retourne dans l'insert n'est pas un nombre");
			test.equal(body.echantillon.title, arrayOfEchantillonInserted[i].title, "Title pas egal");
			test.equal(body.echantillon.description, arrayOfEchantillonInserted[i].description, "Description pas egal");
			test.equal(body.echantillon.url, arrayOfEchantillonInserted[i].url, "url pas egal");
			test.equal(body.echantillon.urlImage, arrayOfEchantillonInserted[i].urlImage, "urlImage pas egal");
			test.equal(body.echantillon.source, arrayOfEchantillonInserted[i].source, "Source pas egal");
			test.equal(body.echantillon.author, arrayOfEchantillonInserted[i].author, "Author pas egal");
			test.equal(body.echantillon.views, 1, "Les views n'ont pas augmente");//On check en meme temps si le comptage de la vue a marche
		}
		test.done();
	});
};

exports.getEchantillonThatDoesntExist = function(test){
	request.get("http://localhost/api/echantillons-gratuits/-9", function(err, response, body){
		body = JSON.parse(body);
		test.equal(body.success, "ko");
		test.done();
	});
};

exports.updateEchantillon = function(test){

	arrayOfBindPutRequest = new Array();
	for(var i = 0; i < arrayOfEchantillonInserted.length; i++){
		
		arrayOfEchantillonInserted[i].title = "NEW Title avec des espaces et des acceents éééé 'et des guillemets \" ohhh  \" "+i;
		arrayOfEchantillonInserted[i].description=  "NEW Description"+i;
		arrayOfEchantillonInserted[i].url= "http://www.newurlthatdoesntexist.com";
		arrayOfEchantillonInserted[i].urlImage=  "http://www.newurlthatdoesntexist.com";
		arrayOfEchantillonInserted[i].author=  "NEW UnitTest"+i;
		arrayOfEchantillonInserted[i].source=  "http://www.newsourcethatdoesntexist.com";
		arrayOfEchantillonInserted[i].category=  "Parfum";
	
		arrayOfBindPutRequest.push(request.put.bind(undefined, {url : "http://localhost/api/echantillons-gratuits/"+arrayOfEchantillonInserted[i]._id, form : arrayOfEchantillonInserted[i]}));
	};
	
	async.parallel(arrayOfBindPutRequest, function(err, results){
		test.equal(err, undefined, "Erreur dans le get des echantillons (erreur technique)" + err);
		for(var i = 0; i < arrayOfEchantillonInserted.length; i++){	
			var body = JSON.parse(results[i][0].body);
			test.equal(body.success, "ok", "Success n'est pas egal a ok dans le update d'un echantillon");
		}
		test.done();
	});
}

exports.updateEchantillonThatDoesntExist = function(test){
	request.put("http://localhost/api/echantillons-gratuits/-9", function(err, response, body){
		body = JSON.parse(body);
		test.equal(body.success, "ko");
		test.done();
	});
};

exports.deleteEchantillons = function(test){
	arrayOfBindDeleteRequest = new Array();
	for(var i = 0; i < arrayOfEchantillonInserted.length; i++){
		arrayOfBindDeleteRequest.push(request.del.bind(undefined, "http://localhost/api/echantillons-gratuits/"+arrayOfEchantillonInserted[i]._id));
	}
	
	async.parallel(arrayOfBindDeleteRequest, function(err, results){
		test.equal(err, undefined, "Erreur dans la suppression des echantillons (erreur technique)" + err);
		for(var i = 0; i < arrayOfEchantillonInserted.length; i++){
			var body = JSON.parse(results[i][0].body);
			test.equal(body.success, "ok", "Success n'est pas egal a ok dans la suppression d'un echantillon");
		}
		test.done();
	});
};

exports.deleteEchantillonThatDoesntExist = function(test){
	request.del("http://localhost/api/echantillons-gratuits/-9", function(err, response, body){
		body = JSON.parse(body);
		test.equal(body.success, "ko");
		test.done();
	});
};

exports.verificationThatTheyDontExistAnyMore = function(test){
	arrayOfBindGetRequest = new Array();
	for(var i = 0; i < arrayOfEchantillonInserted.length; i++){
		arrayOfBindGetRequest.push(request.get.bind(undefined, "http://localhost/api/echantillons-gratuits/"+arrayOfEchantillonInserted[i]._id));
	}
	
	async.parallel(arrayOfBindGetRequest, function(err, results){
		test.equal(err, undefined, "Erreur dans la suppression des echantillons (erreur technique)" + err);
		for(var i = 0; i < arrayOfEchantillonInserted.length; i++){
			var body = JSON.parse(results[i][0].body);
			test.equal(body.success, "ko", "Success n'est pas egal a ko dans l'insert d'un echantillon");
		}
		test.done();
	});
};

/*
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

*/