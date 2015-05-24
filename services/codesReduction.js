var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var async = require("async");
// Connection URL
var urlDatabase = 'mongodb://localhost:27017/';
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var connection = mongoose.connection;
if(!connection.readyState){
	connection = mongoose.connect(urlDatabase);
}
autoIncrement.initialize(connection);

var CodesReductionSchema = new Schema({
	id			: 	ObjectId,
	code   		: 	String,
	brand		: 	String,
	descritpion	:	String,
	url			:	String,
	urlLogo		:	String
});
var CodesReduction = mongoose.model('CodesReduction', CodesReductionSchema);

CodesReductionSchema.plugin(autoIncrement.plugin, 'CodesReduction');
exports.CodesReduction = CodesReduction;

exports.getAllCodesReduction = function(searchCriterias, callback){
	CodesReduction.find(searchCriterias, function(err, result){
		if(err != null){
			callback(err, null);
		}
		callback(err, result);
	});
};

exports.insertCodeReduction = function(codeToInsert, callback){
	var codeReduction = new CodesReduction();
	codeReduction.code = codeToInsert.code;
	codeReduction.brand = codeToInsert.brand;
	codeReduction.descritpion = codeToInsert.descritpion;
	codeReduction.url = codeToInsert.url;
	codeReduction.urlLogo = codeToInsert.urlLogo;
	codeReduction.validityStart = codeToInsert.validityStart;
	codeReduction.validityEnd = codeToInsert.validityEnd;
	
	codeReduction.save(function(err, result){
		if(err) callback(err, null);
		callback(err, result);
	});
};

exports.deleteCodeReduction = function(id, callback){
	CodesReduction.remove({ _id: id }, function(err) {
		callback(err);
	});
};

exports.getOneCodeReduction = function(searchParameter, callback){
	CodesReduction.find({ _id: searchParameter._id, brand: searchParameter.brand }, function(err, result) {
		if(err){
			callback(err, null);
		}else{
			callback(err, result);
		}
	});
};

/*

exports.insertUser = function (user, callback){
	var userToInsert = new Users();
	userToInsert.email= user.email;
	userToInsert.password = user.password;
	userToInsert.login = user.login;
	userToInsert.save(function (err, userInserted) {
		if(err){
			console.log("Erreur lors de l'insertion d'un user");
			callback(err, null);
		}
		callback(err, userInserted);
	});
} 

exports.emailAlreadyExist = function(email, callback){
	Users.findOne({email: email}, function(err, result){
		if(err != null){
			callback(err, null);
		}
		if (result == null){
			callback(err, false);
		}else{
			callback(err, true);
		}
	});
};

exports.loginAlreadyExist = function(login, callback){
	Users.findOne({login: login}, function(err, result){
		if(err != null){
			callback(err, null);
		}
		if (result == null){
			callback(err, false);
		}else{
			callback(err, true);
		}
	});
}

exports.delete = function(id, callback){
	Users.remove({_id: id}, function(err){
		callback(err);
	});
};

exports.getOneUser = function(parametersOfSearch, callback){
	Users.findOne(parametersOfSearch, function(err, result){
		if(err != null){
			callback(err, null);
		}
		callback(err, result);
	});
};

exports.getAllUsers = function (parametersOfSearch, callback){
	Users.find(parametersOfSearch, function (err, docs) {
		if(err){
			console.log("Erreur lors de la recherche d'un user");
			callback(err, null);
		}
		callback(err, docs);
	});
};

exports.connectionInformationAreCorrect = function(emailOrLogin, md5Password, callback){
	async.map([{email:emailOrLogin, password: md5Password}, {login:emailOrLogin, password: md5Password}], exports.getOneUser, function(err, result){	
		if(result[0] == null && result[1] == null){
			callback(err, false);
		}else{
			callback(err, true);
		}
	});
};

*/
