var mongoose = require('mongoose');
autoIncrement = require('mongoose-auto-increment');

// Connection URL
var urlDatabase = 'mongodb://localhost:27017/';
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var connection = mongoose.connection;
if(!connection.readyState){
	connection = mongoose.connect(urlDatabase);
}
autoIncrement.initialize(connection);

var EchantillonsSchema = new Schema({
	id				: 		ObjectId,
    title   		: 		String,
	urlImage   		: 		String,
	description 	: 		String,
	url				: 		String,
	source			: 		String,
	author			: 		String,
	valid			:		Boolean
});
var Echantillons = mongoose.model('Echantillons', EchantillonsSchema);

EchantillonsSchema.plugin(autoIncrement.plugin, 'Echantillons');
  
exports.insertEchantillon = function (echantillon, callback){
	var echantillonToInsert = new Echantillons(echantillon);
	
	echantillonToInsert.save(function (err, echantillonInserted) {
		if(err){
			console.log("Erreur lors de l'insertion d'un echantillon");
			callback(err, null);
		}
		callback(err, echantillonInserted);
	});
} 

exports.getOneEchantillon = function (parametersOfSearch, callback){
	Echantillons.findOne(parametersOfSearch, function (err, echantillon) {
		if(err){
			console.log("Erreur lors de la recherche d'un echantillon");
			callback(err, null);
		}
		callback(err, echantillon);
	});
} 

exports.modifyEchantillon = function(id, newValues, callback){
	Echantillons.update({_id : id}, newValues, null, function(err, result){
		if(err){
			callback(err, null);
		}
		callback(err, result);
	});
};

exports.getAllEchantillons = function (parametersOfSearch, callback){
	Echantillons.find(parametersOfSearch, function (err, echantillon) {
		if(err){
			console.log("Erreur lors de la recherche d'un echantillon");
			callback(err, null);
		}
		callback(err, echantillon);
	});
} 

exports.alreadyExist = function(parametersOfSearch, callback){
	Echantillons.findOne(parametersOfSearch, function (err, echantillon) {
		if(err){
			console.log("Erreur lors de la recherche d'un echantillon");
			callback(err, null);
		}
		if(echantillon == null){
			callback(err, false);
		}else{
			callback(err, true);
		}
	});
}

