var mongoose = require('mongoose');
autoIncrement = require('mongoose-auto-increment');

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

var EchantillonsSchema = new Schema({
	id				: 		ObjectId,
    title   		: 		String,
	urlImage   		: 		String,
	description 	: 		String,
	url				: 		String,
	urlClean		:		String,
	source			: 		String,
	author			: 		{ type: String, default: "Gratisss" },
	validated		:		{ type: Boolean, default: false },
	daySelection	:		{ type: Boolean, default: false },
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
			console.log("Erreur lors de la recherche d'un echantillon : " + err);
			callback(err, null);
		}else{
			if(echantillon != null){//Au cas ou la base de donnee est vide et qu'il n'y a pas d'echantillon
				echantillon.views++;
				echantillon.save();
			}
			callback(err, echantillon);
		}
	});
} 

exports.modifyEchantillon = function(id, newValues, callback){
	Echantillons.update({_id : id}, newValues, null, function(err, numAffected){
		if(err){
			callback(err, null);
		}else{
			if(newValues.daySelection){
				exports.makeEchantillonDailySelection(id, function(){});
			}
			callback(err, numAffected);
		}
	});
};

exports.deleteEchantillon = function(id, callback){
	Echantillons.remove({_id : id}, callback);
};

exports.getAllEchantillons = function (parametersOfSearch, callback){
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

exports.getMostViewedEchantillons = function(callback){
	Echantillons.find({validated: true}).sort({views: 'desc'}).limit(3).exec(callback);
}

exports.getRelatedEchantillons = function(category, callback){
	Echantillons.find({category: category, validated: true}).limit(6).exec(callback);
}

exports.getNewEchantillons = function(callback){
	Echantillons.find({validated: true}).sort({insertedOn: 'desc'}).limit(3).exec(callback);
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
