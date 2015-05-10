var MongoClient = require('mongodb').MongoClient
var assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/myproject';


var createUser = function (email, password, callback){
	// Use connect method to connect to the Server
	MongoClient.connect(url, function(err, db) {
		insertUser(db, {email : email, password: password}, function(result){
			callback(result);
		});
		db.close();
	});
} 

var insertUser = function(db, user, callback) {
	// Get the documents collection
	var collection = db.collection('users');
	// Insert some documents
	collection.insert( user, function(err, result) {
		callback(result);
	});
}