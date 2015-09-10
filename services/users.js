var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var async = require("async");
// Connection URL
var urlDatabase = 'mongodb://localhost:27017/';
//var urlDatabase = 'mongodb://gratisss:chuck norris@ds045679.mongolab.com:45679/gratisss-pre-prod';

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var connection = mongoose.connection;
if(!connection.readyState){
	connection = mongoose.connect(urlDatabase);
}
autoIncrement.initialize(connection);

var UsersSchema = new Schema({
	id				: ObjectId,
    email   		: String,
	password   		: String,
	login			: String,
	name    		: String,
	surname			: String,
	completeName	: String,
	city			: String,
	profilePicture	: { type: String, default: "/img/uploads/profiles/defaultProfilePicture.png" },
	points			: { type: Number, default: 0 }
});
var Users = mongoose.model('Users', UsersSchema);

UsersSchema.plugin(autoIncrement.plugin, 'Users');
 
// middleware
UsersSchema.pre('save', function (next, done) {
	//On verifie que l'email ou le login ne sont pas deja utilise
	//Dans le cas d'une creation la valeur de l'id vaudra undefined. Dans le cas d'un update l'id nous permettra de verifier qu'on se controlle pas soit meme.
	
	var emailBindFunction = exports.emailAlreadyExist.bind(undefined, this._id, this.email);
	var loginBindFunction = exports.loginAlreadyExist.bind(undefined, this._id, this.login);
	async.parallel([emailBindFunction, loginBindFunction], function (err, result){
		if(err || result[0] || result[1])
			next(new Error("email must be unique"));
		next();
	});
});
 
exports.Users = Users;

exports.insertUser = function (user, callback){
	var userToInsert = new Users();
	for(var propertyName in user) {
		userToInsert[propertyName] = user[propertyName];
	}
	userToInsert.save(function (err, userInserted) {
		if(err){
			callback(err, null);
		}
		callback(err, userInserted);
	});
};

exports.modifyUser = function(criterias, newValues, callback){
	
	Users.findOne(criterias, function(err, user){//Plutot que de utiliser le findoneandUpdate on prefaire faire le update de maniere manuel. Comme ca on peut declencher l'event pre save
		if(err){
			callback(err, null);
		}else{
			for(var propertyName in newValues) {
				user[propertyName] = newValues[propertyName];
			}
			user.save(callback);
		}
	});
}

exports.emailAlreadyExist = function(idToDontCheck, email, callback){
	
	var searchCriterias = {};
	searchCriterias.email = email;
	if(idToDontCheck){
		searchCriterias._id = {$ne:idToDontCheck};
	}
	
	Users.findOne(searchCriterias, function(err, result){
		if(err != null){
			callback(err, null);
		}else if (result == null){
			callback(err, false);
		}else{
			callback(err, true);
		}
	});
};

exports.loginAlreadyExist = function(idToDontCheck, login, callback){

	var searchCriterias = {};
	searchCriterias.login = login;
	if(idToDontCheck){
		searchCriterias._id = {$ne:idToDontCheck};
	}

	Users.findOne(searchCriterias, function(err, result){
		if(err != null){
			callback(err, null);
		}else if (result == null){
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
	Users.findOne(parametersOfSearch, callback);
};

exports.getAllUsers = function (parametersOfSearch, callback){
	Users.find(parametersOfSearch, callback);
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
