var userService = require(__dirname + "/../services/users.js");
var mongoose = require('mongoose');//On a besoin de mongoose pour pouvoir fermer la connection a la data base a la fin
var userSavedArray = new Array();

exports.insert = function assertInsertion(assert){
	assert.expect(10);
	for(var i = 0; i < 10 ; i++){
		var userToInsert = new userService.Users();
		userToInsert.email = "email"+i+"@yahoo.fr";
		userToInsert.password = "password";
		userToInsert.save(function (err, userSaved){
			assert.equal(err, null, "L'insertion n'a pas fonctionne");
			userSavedArray.push(userSaved);
			if(userSavedArray.length ==10){
				assert.done();
			}
		});
	}
};

exports.insertDuplicate = function assertInsertDuplicate(assert){
	var userToInsert = new userService.Users();
	userToInsert.email = "email5@yahoo.fr";
	userToInsert.password = "password";
	userToInsert.save(function (err, userSaved){
		assert.notEqual(err, null, "L'insertion duplicate a fonctionner alors que ca n'aurait pas du");
		assert.done();
	});
}

exports.duplicateEmail = function assertDuplicateMail(assert){
	
	userService.verifyIfEmailAlreadyExist("email5@yahoo.fr", function(err, result){
		assert.equal(err, null, "erreur dans la verif de duplication d'email");
		assert.ok(result);
		userService.verifyIfEmailAlreadyExist("emailWhoDontExistYet@yahoo.fr", function(err, result){
			assert.equal(err, null, "erreur dans la verif de duplication d'email");
			assert.equal(result, false, "erreur dans la verif de duplication d'email");
			assert.done();
		});
	});
	
};

exports.gellAll = function assetGetAll(assert){
	var allUsers = userService.getAllUsers(function(err, allUser){
		assert.equal(err, null, "Il y a une erreur dans le getAllUser");
		assert.equal(allUser.length, 10 , "le getall n'a pas retourne 10 utilisateurs");
		assert.done();
	});
};

exports.delete = function assertSuppression(assert){
	assert.expect(10);
	userSavedArray.forEach(function(user){
		userService.delete(user._id, function(err){
			assert.equals(err, null, "La suppression n'a pas fonctionne correctement");
			userSavedArray.pop();
			if(userSavedArray.length ==0){
				mongoose.connection.close();//On ferme la connection pour etre sur que nodeunit se ferme correctement
				assert.done();
			}
		});
	});
	
};
