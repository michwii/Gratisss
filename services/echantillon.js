var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var utils = require(__dirname + "/utils.js");

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

/* 
	Important : PreSave
	Avant de sauvegarder un echantillon il y a differente etape a realiser.
	La premiere est de lui generer une urlClean afin que cette url soit facilement lisible par les moteurs de recherche.
	Comme l'url doit etre unique il faut verifier si l'url que l'on va generer n'est pas deja insere dans la base de donnees.
	Cas particulier si je fais un update d'un echantillon en changeant son titre mais l'url clean generer reste la meme (c'est probable mais rare),
	je risque de declencher une erreur de type "Duplicate urlClean". Voila pourquoi dans la recherche d'une urlClean deja existante on met tous sauf 
	l'id de l'url que je viens de creer. Si l'echantillon que l'on veut ajouter n'a pas encore d'id alors on inclut pas le search criteria car il 
	vaudrait undefined et ferait planter la recherche.
*/
EchantillonsSchema.pre('save', function (next) {	
	if(this.title == undefined || this.description == undefined){//On verify que l'echantillon a au minimun deux valeurs
		var err = new Error('Pas assez de paramettre');
		next(err);
	}else{
		this.urlClean = utils.getCleanUrl(this.title);
		var searchCriterias = {};
		searchCriterias.urlClean = this.urlClean;
		if(this._id != undefined && this._id != null){
			searchCriterias._id= {$ne : this._id};
		}
		
		Echantillons.findOne(searchCriterias, function(err, echantillon){
			if(err){
				next(err);
			}else if(echantillon){
				var err = new Error('Duplicate urlClean');
				next(err);
			}else{
				next();
			}
		});
	}
});

EchantillonsSchema.plugin(autoIncrement.plugin, 'Echantillons');

  
exports.insertEchantillon = function (echantillon, callback){
	var echantillonToInsert = new Echantillons(echantillon);
	echantillonToInsert.save(callback);
} 

exports.getOneEchantillon = function (parametersOfSearch, callback){
	Echantillons.findOne(parametersOfSearch, function (err, echantillon) {
		if(err){
			console.log("Erreur lors de la recherche d'un echantillon : " + err);
			callback(err, null);
		}else{
			if(echantillon != null){//Au cas ou la base de donnees est vide et qu'il n'y a pas d'echantillon
				echantillon.views++;
				echantillon.save(function(err, result){
					//On ne peut pas mettre dirrectement le callback car la fonction save retourne 
					//un parametre en plus qui est le num affecte. Et comme ca cree des problemes
					//dans les callbacks des fonctions qui l'appelle on prefere gerer manuelement 
					//la gestion du callback pour renvoyer les valeurs qu'on veut nous.
					if(err){
						callback(err, null);
					}else{
						callback(err, result);
					}
				});
			}else{
				callback(err, null);
			}
		}
	});
} 

exports.modifyOneEchantillon = function(criterias, newValues, callback){

	//	Avant de faire un update on nettoie le model des champs qui ne servent pas.
	
	delete newValues.views;
	delete newValues.urlClean;
	delete newValues.insertedOn;
	
	//Fin clean model

	Echantillons.findOne(criterias, function(err, echantillon){
		if(err || echantillon == null || echantillon == undefined){
			callback(err, null);
		}else{
			for(var propertyName in newValues) {
				echantillon[propertyName] = newValues[propertyName];
			}
			echantillon.save(callback);
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
