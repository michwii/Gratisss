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

var CodesReductionSchema = new Schema({
	id				: 	ObjectId,
	code   			: 	String,
	brand			: 	String,
	description		:	String,
	url				:	String,
	urlLogo			:	String,
	validityStart	: 	String,
	validityEnd		: 	String
});
var CodesReduction = mongoose.model('CodesReduction', CodesReductionSchema);

CodesReductionSchema.plugin(autoIncrement.plugin, 'CodesReduction');
exports.CodesReduction = CodesReduction;

exports.getAllCodesReduction = function(searchCriterias, callback){
	CodesReduction.find(searchCriterias, function(err, result){
		if(err != null){
			callback(err, null);
		}
		callback(err, result);
	});
};

exports.insertCodeReduction = function(codeToInsert, callback){
	var codeReduction = new CodesReduction();
	codeReduction.code = codeToInsert.code;
	codeReduction.brand = codeToInsert.brand;
	codeReduction.description = codeToInsert.description;
	codeReduction.url = codeToInsert.url;
	codeReduction.urlLogo = codeToInsert.urlLogo;
	codeReduction.validityStart = codeToInsert.validityStart;
	codeReduction.validityEnd = codeToInsert.validityEnd;
	
	codeReduction.save(function(err, result){
		if(err) callback(err, null);
		callback(err, result);
	});
};

exports.deleteCodeReduction = function(id, callback){
	CodesReduction.remove({ _id: id }, function(err) {
		callback(err);
	});
};

exports.getOneCodeReduction = function(searchParameter, callback){
	CodesReduction.find(searchParameter, function(err, result) {
		if(err){
			callback(err, null);
		}else{
			callback(err, result);
		}
	});
};

