var MongoClient = require('mongodb').MongoClient
var assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/';


exports.insertUser = function (user, callback){
	// Use connect method to connect to the Server
	MongoClient.connect(url, function(err, db) {
		if(err){
			callback(err, null);
			db.close();
			return;
		}
		insertUser(db, user, function(result){
			callback(err, result);
			db.close();
		});
		
	});
} 

exports.getAllUsers = function (user, callback){
	// Use connect method to connect to the Server
	MongoClient.connect(url, function(err, db) {
		if(err){
			callback(err, null);
			db.close();
			return;
		}
		getAllUsers(db, user, function(result){
			callback(err, result);
			db.close();
		});
		
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

