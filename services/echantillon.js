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
	validated		:		Boolean,
	daySelection	:		Boolean,
	category		:		String,
	views			:		{ type: Number, default: 0 },
	insertedOn		:		{ type: Date, default: Date.now }
});
var Echantillons = mongoose.model('Echantillons', EchantillonsSchema);

EchantillonsSchema.plugin(autoIncrement.plugin, 'Echantillons');

  
exports.insertEchantillon = function (echantillon, callback){
	var echantillonToInsert = new Echantillons(echantillon);
	
	echantillonToInsert.save(function (err, echantillonInserted) {
		if(err){
			console.log("Erreur lors de l'insertion d'un echantillon");
			callback(err, null);
		}else{
			callback(err, echantillonInserted);
		}
	});
} 

exports.getOneEchantillon = function (parametersOfSearch, callback){
	Echantillons.findOne(parametersOfSearch, function (err, echantillon) {
		if(err){
			console.log("Erreur lors de la recherche d'un echantillon");
			callback(err, null);
		}else{
			echantillon.views++;
			echantillon.save();
			callback(err, echantillon);
		}
	});
} 

exports.modifyEchantillon = function(id, newValues, callback){
	Echantillons.update({_id : id}, newValues, null, function(err, result){
		if(err){
			callback(err, null);
		}else{
			if(newValues.daySelection){
				exports.makeEchantillonDailySelection(id, function(){});
			}
			callback(err, result);
		}
	});
};

exports.deleteEchantillon = function(id, callback){
	Echantillons.remove({_id : id}, function(err, result){
		if(err){
			callback(err, null);
		}
		callback(err, result);
	});
};

exports.getAllEchantillons = function (parametersOfSearch, callback){
	/*Echantillons.find(parametersOfSearch, function (err, echantillon) {
		if(err){
			console.log("Erreur lors de la recherche d'un echantillon");
			callback(err, null);
		}else{
			callback(err, echantillon);
		}
		
	});
	*/
	Echantillons.find(parametersOfSearch, callback);
} 

exports.alreadyExist = function(parametersOfSearch, callback){
	Echantillons.findOne(parametersOfSearch, function (err, echantillon) {
		if(err){
			console.log("Erreur lors de la recherche d'un echantillon");
			callback(err, null);
		}else{
			if(echantillon == null){
				callback(err, false);
			}else{
				callback(err, true);
			}
		}
		
	});
}

exports.getMostViewedEchantillon = function(callback){
	Echantillons.find().sort({views: 'desc'}).limit(3).exec(callback);
}

exports.getRelatedEchantillon = function(category, callback){

}

exports.getRecentEchantillon = function(callback){
	
}

exports.makeEchantillonDailySelection = function(echantillonID, callback){

	Echantillons.update(null, { $set: { daySelection: false }}, { multi: true }, function(err, numAffected){
		if(err){
			console.log(err);
			callback(err, null);
		}else{
			Echantillons.update({_id:echantillonID}, { $set: { daySelection: true }}, { multi: false }, function(err, numAffected){
				callback(err, numAffected);
			});
		}
	});

};
