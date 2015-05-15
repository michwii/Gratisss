var mongoose = require('mongoose');
autoIncrement = require('mongoose-auto-increment');

// Connection URL
var urlDatabase = 'mongodb://localhost:27017/';
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var connection = mongoose.connect(urlDatabase);
autoIncrement.initialize(mongoose.connection);

var UsersSchema = new Schema({
	id			: ObjectId,
    email   	: String,
	password   	: String,
	name    	: String,
	surname		: String
});
var Users = mongoose.model('Users', UsersSchema);

UsersSchema.plugin(autoIncrement.plugin, 'Users');
  
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

exports.getAllUsers = function (parametersOfSearch, callback){
	Users.find(parametersOfSearch, function (err, docs) {
		if(err){
			console.log("Erreur lors de la recherche d'un user");
			callback(err, null);
		}
		callback(err, docs);
	});
} 


