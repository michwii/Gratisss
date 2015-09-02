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
	id			: ObjectId,
    email   	: String,
	password   	: String,
	login		: String,
	name    	: String,
	surname		: String,
	completeName: String,
	city		: String,
	points		: { type: Number, default: 0 }
});
var Users = mongoose.model('Users', UsersSchema);

UsersSchema.plugin(autoIncrement.plugin, 'Users');
 
// middleware
UsersSchema.pre('save', function (next, done) {

	var emailBindFunction = exports.emailAlreadyExist.bind(undefined, this.email);
	var loginBindFunction = exports.loginAlreadyExist.bind(undefined, this.login);

	async.parallel([emailBindFunction, loginBindFunction], function (err, result){
		if(err || result[0] || result[1])
			next(new Error("email must be unique"));
		next();
	});
	
});
 
exports.Users = Users;

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
};

exports.modifyUser = function(criterias, newValues, callback){
	Users.findOneAndUpdate(criterias, newValues, callback);
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
