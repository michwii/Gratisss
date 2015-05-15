var mongoose = require('mongoose');

// Connection URL
var urlDatabase = 'mongodb://localhost:27017/';
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UsersSchema = new Schema({
	id			: ObjectId,
    email   	: String,
	password   	: String,
	name    	: String,
	surname		: String
});
var Users = mongoose.model('Users', UsersSchema);

mongoose.connect(urlDatabase);


  
exports.insertUser = function (user, callback){
	var userToInsert =new Users();
	userToInsert.email= user.email;
	userToInsert.password = user.password;
	
	userToInsert.save(function (err) {
		if(err){
			console.log("Erreur lors de l'insertion d'un user");
			callback(err, null);
		}
		callback(err, userToInsert);
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


var insertUser = function(db, user, callback) {
	// Get the documents collection
	var collection = db.collection('users');
	// Insert some documents
	collection.insert(user, function(err, result) {
		if(err){
			callback(err, null);
			return;
		}
		callback(err, result);
	});
}

var getAllUsers = function(db, user, callback) {
	// Get the documents collection
	var collection = db.collection('users');
	// Insert some documents
	collection.find(user).toArray(function(err, result) {
		if(err){
			callback(err, null);
			return;
		}
		console.log(result);
		callback(err, result);
	});
}

