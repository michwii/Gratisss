var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var async = require("async");
// Connection URL
var urlDatabase = 'mongodb://localhost:27017/';
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var connection = mongoose.connect(urlDatabase);
autoIncrement.initialize(connection);

var UsersSchema = new Schema({
	id			: ObjectId,
    email   	: String,
	password   	: String,
	name    	: String,
	surname		: String
});
var Users = mongoose.model('Users', UsersSchema);

UsersSchema.plugin(autoIncrement.plugin, 'Users');
 
// middleware
UsersSchema.pre('save', function (next, done) {
	exports.verifyIfEmailAlreadyExist(this.email, function(err, result){
		if(err || result)
			next(new Error("email must be unique"));
		next();
	});
});
 
exports.Users = Users;

exports.insertUser = function (user, callback){
	var userToInsert = new Users();
	userToInsert.email= user.email;
	userToInsert.password = user.password;
	
	userToInsert.save(function (err, userInserted) {
		if(err){
			console.log("Erreur lors de l'insertion d'un user");
			callback(err, null);
		}
		callback(err, userInserted);
	});
} 

exports.verifyIfEmailAlreadyExist = function(email, callback){
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
