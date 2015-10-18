
//Attention il y a une difference entre les requete post/put envoyees avec le parametre form et formData. L'un envoi avec un content-type url-encoded l'autre est multi-part

var async = require('async');
var request = require('request');
var md5 = require('md5');


var userSavedArray = new Array();
var userSavedCookie = new Array();
var singleUserWithProfilePicture = {};
var singleUserWithProfilePictureCookie = {};

for(var i = 0; i < 10 ; i++){
	var userToInsert = {};
	userToInsert.email = "email"+i+"@yahoo.fr";
	userToInsert.password = "password"+i;
	userToInsert.login = "login"+i;
	userSavedArray.push(userToInsert);
}

var getAuthenticationCookie = function(email, password, callback){
	
	request.post({url:"http://localhost/api/users/connexion", form:{email:email, password:password}}, function(err, response, body){
		if(err){
			callback(err, null);
		}else{
			var parsedResponse = JSON.parse(body);
			if(parsedResponse.success != "ok"){
				callback(err, null);
			}else if(response.headers && response.headers["set-cookie"]){
				var cookie = response.headers["set-cookie"][0];
				callback(err, cookie);
			}else{
				callback(err, null);
			}
		}
	});
};


exports.insert = function(test){
	var arrayBindPostRequest = new Array();
	for(var i = 0; i < userSavedArray.length; i++){
		arrayBindPostRequest.push(request.post.bind(undefined, {url:"http://localhost/api/users", formData:userSavedArray[i]}));
	}
	async.parallel(arrayBindPostRequest, function(err, results){
		for(var i = 0 ; i < results.length; i++){
			var parsedResponse = JSON.parse(results[i][0].body);
			test.equal(parsedResponse.success,"ok", "Success pas egal a OK");
			if(parsedResponse.success == "ok"){//On test avant car sinon la suite des tests ne se lance pas si une exeption se lance
				userSavedArray[i]._id = parsedResponse.userCreated._id;
				test.equal(parsedResponse.userCreated.email, userSavedArray[i].email);
				test.equal(parsedResponse.userCreated.password, md5(userSavedArray[i].password));
				test.equal(parsedResponse.userCreated.email, userSavedArray[i].email);
				test.equal(parsedResponse.userCreated.email, userSavedArray[i].email);
			}
		}
		test.done();
	});
};

exports.insertDuplicateEmail = function(test){
	var userToInsert = {};
	userToInsert.email = "email5@yahoo.fr";
	userToInsert.password = "password";
	userToInsert.login = "loginWhichDoesExistYet";
	request.post({url:"http://localhost/api/users", formData:userToInsert}, function(err, request, body){
		test.equal(err, null, "L'insertion duplicate email a fonctionner alors que ca n'aurait pas du");		
		if(err == null){
			var parsedResponse = JSON.parse(body);
			test.equal(parsedResponse.success, "ko", "Duplicate mail insertion failed");
			test.equal(request.statusCode, 501, "Duplicate mail insertion failed");
		}
		test.done();
	});
};


exports.insertDuplicateLogin = function(test){
	var userToInsert = {};
	userToInsert.email = "emailWhichDoesntExistYet@yahoo.fr";
	userToInsert.password = "password";
	userToInsert.login = "login5";
	request.post({url:"http://localhost/api/users", formData:userToInsert}, function(err, request, body){
		test.equal(err, null, "L'insertion duplicate login a fonctionner alors que ca n'aurait pas du");		
		if(err == null){
			var parsedResponse = JSON.parse(body);
			test.equal(parsedResponse.success, "ko", "Duplicate login insertion failed");
			test.equal(request.statusCode, 501, "Duplicate login insertion failed");
		}
		test.done();
	});
};

exports.lackOfEmailParameter = function(test){
	var userToInsert = {};
	//userToInsert.email = "emailWhichDoesntExistYet@yahoo.fr";
	userToInsert.password = "password";
	userToInsert.login = "loginWhichDoNotExist";
	request.post({url:"http://localhost/api/users", formData:userToInsert}, function(err, request, body){
		test.equal(err, null, "L'insertion lackOfEmail a fonctionner alors que ca n'aurait pas du");		
		if(err == null){
			var parsedResponse = JSON.parse(body);
			test.equal(parsedResponse.success, "ko", "lackOfEmail insertion failed");
			test.equal(request.statusCode, 501, "lackOfEmail insertion failed");
		}
		test.done();
	});
};

exports.lackOfPasswordParameter = function(test){
	var userToInsert = {};
	userToInsert.email = "lackOfPasswordParameter@yahoo.fr";
	//userToInsert.password = "password";
	userToInsert.login = "loginWhichDoNotExist";
	request.post({url:"http://localhost/api/users", formData:userToInsert}, function(err, request, body){
		test.equal(err, null, "L'insertion lackOfPassword a fonctionner alors que ca n'aurait pas du");		
		if(err == null){
			var parsedResponse = JSON.parse(body);
			test.equal(parsedResponse.success, "ko", "lackOfPassword insertion failed");
			test.equal(request.statusCode, 501, "lackOfPassword insertion failed");
		}
		test.done();
	});
};

exports.lackOfLoginParameter = function(test){
	var userToInsert = {};
	userToInsert.email = "emailWhichDoesntExistYet@yahoo.fr";
	userToInsert.password = "password";
	//userToInsert.login = "loginWhichDoNotExist";
	request.post({url:"http://localhost/api/users", formData:userToInsert}, function(err, request, body){
		test.equal(err, null, "L'insertion lackOfLogin a fonctionner alors que ca n'aurait pas du");		
		if(err == null){
			var parsedResponse = JSON.parse(body);
			test.equal(parsedResponse.success, "ko", "lackOfLogin insertion failed");
			test.equal(request.statusCode, 501, "lackOfLogin insertion failed");
		}
		test.done();
	});
};

exports.insertMalFormedEmail = function(test){
	var userToInsert = {};
	userToInsert.email = "emailMalFormed@yahoo@jfd.fr";
	userToInsert.password = "password";
	userToInsert.login = "loginWhichDoNotExistYet";
	request.post({url:"http://localhost/api/users", formData:userToInsert}, function(err, request, body){
		test.equal(err, null, "L'insertion malFormed a fonctionner alors que ca n'aurait pas du");		
		if(err == null){
			var parsedResponse = JSON.parse(body);
			test.equal(parsedResponse.success, "ko", "malFormed insertion failed");
			test.equal(request.statusCode, 501, "malFormed insertion failed");
		}
		test.done();
	});
};

exports.insertWithAProfilePicture = function(test){

	var userToInsert = {};
	userToInsert.email = "emailOfSomeOneWithAPhoto@gmail.com";
	userToInsert.password = "passwordOfSomeOneWithAPhoto";
	userToInsert.login = "loginOfSomeOneWithAPhoto";
	userSavedArray.push(userToInsert);

	request.post({
		url:"http://localhost/api/users", 
		formData:{
			email:"emailOfSomeOneWithAPhoto@gmail.com",
			password:"passwordOfSomeOneWithAPhoto",
			login:"loginOfSomeOneWithAPhoto",
			profilePicture:request.get("http://localhost/img/uploads/profiles/defaultProfilePicture.png")
		}},
		function(err, response, body){
			test.equal(err, null, "Erreur technique err != null dans insertWithAProfilePicture");
			if(!err){
				var parsedResponse = JSON.parse(body);
				test.notEqual(parsedResponse.userCreated, null, "User vaut null dans insertWithAProfilePicture");
				test.equal(parsedResponse.success, "ok", "Success != ok in insertWithAProfilePicture");
				if(parsedResponse.userCreated){
					var userToModify = userSavedArray[userSavedArray.length-1];
					userToModify._id = parsedResponse.userCreated._id;
					userToModify.profilePicture = parsedResponse.userCreated.profilePicture;
					test.notEqual(parsedResponse.userCreated._id, null, "User.id vaut null dans insertWithAProfilePicture");
					test.notEqual(parsedResponse.userCreated.login, null, "User.login vaut null dans insertWithAProfilePicture");
					test.notEqual(parsedResponse.userCreated.password, null, "User.password vaut null dans insertWithAProfilePicture");
					test.notEqual(parsedResponse.userCreated.email, null, "User.email vaut null dans insertWithAProfilePicture");
					test.notEqual(parsedResponse.userCreated.profilePicture, null, "User.profilePicture vaut null dans insertWithAProfilePicture");
				}
			}
			test.done();
		}
	);
};

//Connexion tests

exports.connexion = function(test){
	var bindGetAuthenticationCookie = new Array();
	for(var i = 0; i < userSavedArray.length; i++){
		bindGetAuthenticationCookie.push(getAuthenticationCookie.bind(undefined, userSavedArray[i].email, userSavedArray[i].password));
	}
	
	async.parallel(bindGetAuthenticationCookie, function(err, results){
		for(var i = 0; i < results.length; i++){
			test.equal(err, null, "Erreur technique dans la connexion");
			test.notEqual(results[i], null, "Erreur dans la connexion");
			userSavedCookie.push(results[i]);
		}
		test.done();
	});
};

exports.connexionWithFakeCredential = function(test){
	request.post({url:"http://localhost/api/users/connexion", form:{email:"michwii@yahoo.fr", password:"PasswordWhichIsNotCorrect"}}, function(err, response, body){
		test.equal(err, null, "Erreur technique fake connexion");
		if(!err){
			var responseCode = response.statusCode;
			var parsedResponse = JSON.parse(body);
			test.equal(responseCode, 403, "Respond Code not equal to 403 for fake authentication");
			test.equal(parsedResponse.success, "ko", "Success not ko for fake authentication");
		}
		test.done();
	});
}

exports.getProfilPage = function(test){
	var bindGetProfilPage = new Array();
	for(var i = 0 ; i < userSavedArray.length; i++){
		bindGetProfilPage.push(request.get.bind(undefined, {url:"http://localhost/users/"+userSavedArray[i]._id , headers:{"Cookie": userSavedCookie[i]}}));
	}
	async.parallel(bindGetProfilPage, function(err, results){
		test.equal(err, null, "Erreur Technique getProfilPage");
		if(!err){
			for(var i = 0 ; i < results.length; i++){
				var responseCode = results[i][0].statusCode;
				test.equal(responseCode, 200, "Erreur getProfilPage");
			}
		}
		test.done();
	});
};

exports.getProfilPageWithoutBeingConnected = function(test){
	request.get("http://localhost/users/"+ userSavedArray[0]._id, function(err, response, body){
		test.equal(err, null, "Erreur technique getProfilPageWithoutBeingConnected")
		if(!err){
			var responseCode = response.statusCode;
			test.equal(responseCode, 403, "Consultation d'un profil sans etre authentifie");
		}
		test.done();
	});
};

exports.getProfilOfSomeOneElse = function(test){
	request.get({url : "http://localhost/users/"+ userSavedArray[0]._id, headers:{Cookie : userSavedCookie[1]}}, function(err, response, body){
		test.equal(err, null, "Erreur technique getProfilOfSomeOneElse")
		if(!err){
			var responseCode = response.statusCode;
			test.equal(responseCode, 403, "Consultation d'un profil of someone else");
		}
		test.done();
	});
};


//End Connexion tests

exports.updateUsers = function(test){
	var arrayBindPutRequest = new Array();

	//for(var i = 0; i < userSavedArray.length ; i++){
	for(var i = 0; i < 5 ; i++){
		var userToInsert = userSavedArray[i];
		userToInsert.email = "newEmail"+i+"@yahoo.fr";
		userToInsert.password = "newPassword"+i;
		userToInsert.login = "newLogin"+i;
		userToInsert.profilePicture = request.get("http://localhost/img/uploads/profiles/defaultProfilePicture.png");

		arrayBindPutRequest.push(request.put.bind(undefined, {url:"http://localhost/api/users/"+ userToInsert._id, formData:userToInsert, headers:{Cookie:userSavedCookie[i]}}));
		console.log(userToInsert);
		console.log(userSavedCookie[i]);
	}
	console.log("Creation des put request en memoire effectue");
	async.parallel(arrayBindPutRequest, function(err, results){
		
		test.equal(err, undefined, "Erreur technique pour l'update d'un user");
		console.log("Erreur = " +err);
		if(err == undefined){
			for(var i = 0 ; i < results.length; i++){
				var parsedResponse = JSON.parse(results[i][0].body);
				test.equal(parsedResponse.success,"ok", "Success pas egal a OK");
				if(parsedResponse.success == "ok"){//On test avant car sinon la suite des tests ne se lance pas si une exeption se lance
					userSavedArray[i].profilePicture = parsedResponse.user.profilePicture;//On met a jour la nouvelle photo De Profile
					test.equal(parsedResponse.user.email, userSavedArray[i].email);
					test.equal(parsedResponse.user.password, md5(userSavedArray[i].password));
					test.equal(parsedResponse.user.email, userSavedArray[i].email);
					test.equal(parsedResponse.user.email, userSavedArray[i].email);
					test.notEqual(parsedResponse.user.profilePicture, null);
				}
			}
		}
		test.done();
	});
};

exports.updateWithEmailThatAlreadyExist = function(test){
	var userToInsert = {};
	userToInsert._id = userSavedArray[5]._id;
	userToInsert.email = "newEmail2@yahoo.fr";//Email qui existe deja
	userToInsert.password = "password";
	userToInsert.login = "newNewLogin";
	
	request.put({url:"http://localhost/api/users/"+ userToInsert._id, formData:userToInsert, headers:{Cookie:userSavedCookie[5]}}, function(err, response, body){
		test.equal(err, null, "Erreur technique with update duplicate email");
		var parsedResponse = JSON.parse(body);
		test.equal(parsedResponse.success, "ko", "update should not work because of duplicate email");
		test.done();
	});

};

exports.updateWithLoginThatAlreadyExist = function(test){
	var userToInsert = {};
	userToInsert._id = userSavedArray[4]._id;
	userToInsert.email = "newEmail@yahoo.fr";
	userToInsert.password = "password";
	userToInsert.login = "newLogin5";//Login that already exist
	
	request.put({url:"http://localhost/api/users/"+ userToInsert._id, formData:userToInsert, headers:{Cookie:userSavedCookie[4]}}, function(err, response, body){
		test.equal(err, null, "Erreur technique with update duplicate login");
		var parsedResponse = JSON.parse(body);
		test.equal(parsedResponse.success, "ko", "update should not work because of duplicate login");
		test.done();
	});

};



/*
exports.gellAll = function assetGetAll(assert){
	
	var arrayOfSearchFunctionBinded = new Array();
	for(var i = 0; i < 10; i++){
		var bindedFunctionToTest = userService.getOneUser.bind(undefined, userSavedArray[i]);
		arrayOfSearchFunctionBinded.push(bindedFunctionToTest);
	}
	
	async.series(arrayOfSearchFunctionBinded, function(err, result){
		for(var i = 0; i < 10; i++){
			assert.equal(userSavedArray[i]._id, result[i]._id,"le getall n'a pas retourne 10 utilisateurs");
		}
		assert.done();
	});
};
*/

//Delete
exports.deleteWithoutBeingAuthenticated = function(test){
	var arrayBindDelete = new Array();
	for(var i = 0; i < userSavedArray.length ; i++){
		arrayBindDelete.push(request.del.bind(undefined, {url:"http://localhost/api/users/"+userSavedArray[i]._id }));
	}
	
	async.parallel(arrayBindDelete, function(err, results){
		for(var i = 0 ; i < results.length; i++){
			var responseCode= results[i][0].statusCode;
			var parsedResponse = JSON.parse(results[i][0].body);
			test.equal(responseCode, 403, "Erreur deleteWithoutBeingAuthenticated ");
			test.equal(parsedResponse.success, "ko", "Erreur deleteWithoutBeingAuthenticated");
		}
		test.done();
	});
};

exports.deleteProfilOfSomeOneElse = function(test){
	request.del({url : "http://localhost/api/users/"+ userSavedArray[0]._id, headers:{Cookie : userSavedCookie[2]}}, function(err, response, body){
		test.equal(err, null, "Erreur technique deleteProfilOfSomeOneElse")
		if(!err){
			var responseCode = response.statusCode;
			//var parsedResponse = JSON.parse(body);
			test.equal(responseCode, 403, "delete d'un profil of someone else");
		}
		test.done();
	});
};


exports.delete = function (test){
	var arrayBindDelete = new Array();
	for(var i = 0; i < userSavedArray.length ; i++){
		arrayBindDelete.push(request.del.bind(undefined, {url:"http://localhost/api/users/"+userSavedArray[i]._id, headers:{Cookie:userSavedCookie[i]}}));
	}
	
	async.parallel(arrayBindDelete, function(err, results){
		for(var i = 0 ; i < results.length; i++){
			var parsedResponse = JSON.parse(results[i][0].body);
			test.equal(parsedResponse.success,"ok", "Erreur delete");
		}
		test.done();
	});
};

//End of delete

exports.verifyTheyDoNotExistAnyMore = function(test){
	var arrayBindGet = new Array();
	for(var i = 0; i < userSavedArray.length ; i++){
		arrayBindGet.push(request.get.bind(undefined, "http://localhost/api/users/"+userSavedArray[i]._id));
	}
	
	async.parallel(arrayBindGet, function(err, results){
		for(var i = 0 ; i < results.length; i++){
			var parsedResponse = JSON.parse(results[i][0].body);
			var statusCode = results[i][0].statusCode;
			test.equal(parsedResponse.success,"ko", "Erreur apres suppression il existe encore");
			test.equal(statusCode, 404, "Erreur apres suppression il existe encore");
		}
		test.done();
	});
};

exports.verifyThatTheProfilePicturesDoNotExistAnyMore = function(test){
	var arrayBindGet = new Array();
	for(var i = 0; i < userSavedArray.length ; i++){
		arrayBindGet.push(request.get.bind(undefined, "http://localhost"+userSavedArray[i].profilePicture));
	}
	
	async.parallel(arrayBindGet, function(err, results){
		for(var i = 0 ; i < results.length; i++){
			var statusCode = results[i][0].statusCode;
			test.equal(statusCode, 404, "Erreur apres suppression l'image de profile existe encore");
		}
		test.done();
	});
};
