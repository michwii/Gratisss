var async = require('async');
var request = require('request');
//var echantillonService = require(__dirname + "/../services/echantillon");
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
			
			if(body.echantillon){//Car sinon en cas de retour ko les test suivants font planter toute la batterie de test
				test.equal(typeof body.echantillon._id, typeof 0, "L'id retourne dans l'insert n'est pas un nombre");
				test.equal(body.echantillon.title, arrayOfEchantillonInserted[i].title, "Title pas egal");
				test.equal(body.echantillon.description, arrayOfEchantillonInserted[i].description, "Description pas egal");
				test.equal(body.echantillon.url, arrayOfEchantillonInserted[i].url, "url pas egal");
				test.equal(body.echantillon.urlImage, arrayOfEchantillonInserted[i].urlImage, "urlImage pas egal");
				test.equal(body.echantillon.source, arrayOfEchantillonInserted[i].source, "Source pas egal");
				test.equal(body.echantillon.author, arrayOfEchantillonInserted[i].author, "Author pas egal");
				test.equal(body.echantillon.urlClean, utils.getCleanUrl(arrayOfEchantillonInserted[i].title), "urlClean pas bon");
				arrayOfEchantillonInserted[i] = body.echantillon;//On set l'id + tout les propriete genere automatiquement pour pouvoir s'en reservir dans la suppression et le modify
			}else{
				arrayOfEchantillonInserted[i]._id = -1;//Comme ca on est sur de declancher une erreur correct pour tous les tests qui vont suivre (sinon on aurait la valeur undefined a chaque appel)
			}		
		}
		test.done();
	});
};

exports.insertEchantillonWithATitleThatAlreadyExist = function(test){
	
	var echantillonToInsert = {
		title: "Title avec des espaces et des acceents éééé 'et des guillemets \" ohhh  \" "+5,
		description: "This insertion should not work because the title is already present into the database and therefore the url generated will create confusion", 
		url: "http://www.fake.com",
		urlImage: "http://www.urlthatdoesntexist.com",
		author: "UnitTest"+i,
		source: "http://www.sourcethatdoesntexist.com",
		category: "Bebe"
	};

	request.post({url : "http://localhost/api/echantillons-gratuits", formData:echantillonToInsert}, function(err, response, body){
		body = JSON.parse(body);
		test.equal(body.success, "ko");
		test.done();
	});
	
}



exports.getEchantillonsThatHaveBeenInserted = function(test){
	arrayOfBindGetRequest = new Array();
	for(var i = 0; i < arrayOfEchantillonInserted.length; i++){
		arrayOfBindGetRequest.push(request.get.bind(undefined, "http://localhost/api/echantillons-gratuits/"+arrayOfEchantillonInserted[i]._id));//On met un title bidon car si le premier insert foire l'id vaut undefined et c'est donc considere comme le title
	}
	async.parallel(arrayOfBindGetRequest, function(err, results){
		test.equal(err, undefined, "Erreur dans le get des echantillons (erreur techniqueAAAAAAAAAA)" + err);
		
		
		for(var i = 0; i < arrayOfEchantillonInserted.length; i++){
			var body = JSON.parse(results[i][0].body);
			test.equal(body.success, "ok", "Success n'est pas egal a ok dans le get d'un echantillon");
			test.notEqual(body.echantillon, null, "La reponse du get ne contient pas un echantillon");
			test.notEqual(body.echantillon, undefined, "La reponse du get ne contient pas un echantillon");
			if(body.echantillon){//Car sinon en cas de retour ko les test suivants font planter toute la batterie de test
				test.equal(typeof body.echantillon._id, typeof 0, "L'id retourne dans get n'est pas un nombre");
				test.equal(body.echantillon.title, arrayOfEchantillonInserted[i].title, "Title pas egal");
				test.equal(body.echantillon.description, arrayOfEchantillonInserted[i].description, "Description pas egal");
				test.equal(body.echantillon.url, arrayOfEchantillonInserted[i].url, "url pas egal");
				test.equal(body.echantillon.urlImage, arrayOfEchantillonInserted[i].urlImage, "urlImage pas egal");
				test.equal(body.echantillon.source, arrayOfEchantillonInserted[i].source, "Source pas egal");
				test.equal(body.echantillon.author, arrayOfEchantillonInserted[i].author, "Author pas egal");
				test.equal(body.echantillon.views, 1, "Les views n'ont pas augmente");//On check en meme temps si le comptage de la vue a marche
				test.equal(body.echantillon.validated, false, "Ils ont ete valide");		
				test.equal(body.echantillon.urlClean, arrayOfEchantillonInserted[i].urlClean, "urlClean pas egal");					
			}
		}	
		test.done();
	});
};

exports.getEchantillonsThatDoNotExist = function(test){
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
			//test.equal(body.echantillon.urlClean, utils.cleanUrl(arrayOfEchantillonInserted[i].title), "URLClean n'est pas bonne");
			if(body.echantillon){
				arrayOfEchantillonInserted[i]= body.echantillon;
			}
		}
		test.done();
	});
}

exports.updateEchantillonThatDoesntExist = function(test){
	request.put("http://localhost/api/echantillons-gratuits/-9", function(err, response, body){
		body = JSON.parse(body);		
		test.equal(body.success, "ko", "Erreur echantillon qui n'existe pas update");
		test.done();
	});
};

exports.verifyEchantillonAfterUpdate = function(test){
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
			if(body.echantillon){//Car sinon en cas de retour ko les test suivants font planter toute la batterie de test
				test.equal(typeof body.echantillon._id, typeof 0, "L'id retourne dans l'insert n'est pas un nombre");
				test.equal(body.echantillon.title, arrayOfEchantillonInserted[i].title, "Title pas egal");
				test.equal(body.echantillon.description, arrayOfEchantillonInserted[i].description, "Description pas egal");
				test.equal(body.echantillon.url, arrayOfEchantillonInserted[i].url, "url pas egal");
				test.equal(body.echantillon.urlImage, arrayOfEchantillonInserted[i].urlImage, "urlImage pas egal");
				test.equal(body.echantillon.source, arrayOfEchantillonInserted[i].source, "Source pas egal");
				test.equal(body.echantillon.author, arrayOfEchantillonInserted[i].author, "Author pas egal");
				test.equal(body.echantillon.views, 2, "Les views n'ont pas augmente");//On check en meme temps si le comptage de la vue a marche
				test.equal(body.echantillon.validated, false, "Les views sont valides");	
			}
		}
		test.done();
	});
}

exports.verifyTheyExistWithASearchQuery = function(test){
	arrayOfBindGetRequest = new Array();
	for(var i = 0; i < arrayOfEchantillonInserted.length; i++){
		arrayOfBindGetRequest.push(request.get.bind(undefined, "http://localhost/api/echantillons-gratuits/search/urlClean="+arrayOfEchantillonInserted[i].urlClean));
	}
	
	async.parallel(arrayOfBindGetRequest, function(err, results){
		test.equal(err, undefined, "Erreur dans le search des echantillons (erreur technique)" + err);
		
		for(var i = 0; i < arrayOfEchantillonInserted.length; i++){
				
			var body = JSON.parse(results[i][0].body);
			test.equal(body.success, "ok", "Success n'est pas egal a ok dans le search d'un echantillon");
			test.notEqual(body.echantillon, null, "La reponse du search ne contient pas un echantillon");
			
			test.notEqual(body.echantillon, undefined, "La reponse du search ne contient pas un echantillon");
			if(body.echantillon){//Car sinon en cas de retour ko les test suivants font planter toute la batterie de test
				test.equal(typeof body.echantillon._id, typeof 0, "L'id retourne dans search n'est pas un nombre");
				test.equal(body.echantillon.title, arrayOfEchantillonInserted[i].title, "Title pas egal");
				test.equal(body.echantillon.description, arrayOfEchantillonInserted[i].description, "Description pas egal");
				test.equal(body.echantillon.url, arrayOfEchantillonInserted[i].url, "url pas egal");
				test.equal(body.echantillon.urlImage, arrayOfEchantillonInserted[i].urlImage, "urlImage pas egal");
				test.equal(body.echantillon.source, arrayOfEchantillonInserted[i].source, "Source pas egal");
				test.equal(body.echantillon.author, arrayOfEchantillonInserted[i].author, "Author pas egal");
				test.equal(body.echantillon.views, 3, "Les views n'ont pas augmente");//On check en meme temps si le comptage de la vue a marche
				test.equal(body.echantillon.validated, false, "Les views n'ont pas augmente");
			}
		}
		
		test.done();
	});
}

exports.verifyTheyDontExistWithASearchQuery = function(test){
	request.get("http://localhost/api/echantillons-gratuits/search/urlClean=ForSureThisURLDoesNotExist", function(err, response, body){
		body = JSON.parse(body);		
		test.equal(body.success, "ko", "Erreur echantillon a ete trouve dans le search");
		test.done();
	});

}


exports.deleteEchantillonThatDoesntExist = function(test){
	request.del("http://localhost/api/echantillons-gratuits/-9", function(err, response, body){
		body = JSON.parse(body);
		test.equal(body.success, "ko");
		test.done();
	});
};


//----------------------------------------------
//On clean tout ce que l'on vient de creeer
//----------------------------------------------

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

//On verify maintenant que les echantillons en prod fonctionne tjs

exports.allEchantillonsPresentIntoDatabaseAreReachable = function(test){
	request.get("http://localhost/api/echantillons-gratuits", function(err, response, body){
		test.equal(err, undefined, "Erreur dans le getAllEchantillonsAPI (erreur technique)" + err);
		var responseParsed = JSON.parse(body);
		test.equal(responseParsed.success, "ok", "le success n'est pas egal a OK");
		
		var allEchantillons = responseParsed.echantillons;
		
		var arrayOfEchantillonBindRequest = new Array();
		for(var i = 0; i < allEchantillons.length; i++){
			var echantillon = allEchantillons[i];
			if(echantillon.validated){
				//On va lancer une requette HTTP aussi bien sur l'API que sur l'interface WEB classique
				arrayOfEchantillonBindRequest.push(request.get.bind(undefined, "http://localhost/echantillons-gratuits/"+echantillon.urlClean+"/"+echantillon._id));
				arrayOfEchantillonBindRequest.push(request.get.bind(undefined, "http://localhost/api/echantillons-gratuits/"+echantillon._id));
			}
		}
		
		async.parallel(arrayOfEchantillonBindRequest, function(err, responses){
			test.equal(err, undefined, "Erreur dans le getAllEchantillonsAPI (erreur technique)" + err);
			for(var i = 0; i < responses.length; i++){
				var statusCodeRequest = responses[i][0].statusCode;
				test.equal(statusCodeRequest, 200, "Le code de retour n'est pas 200");
			}
			test.done();
		});
		
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


