var codesReductionService = require(__dirname + "/../services/codesReduction.js");
var mongoose = require('mongoose');//On a besoin de mongoose pour pouvoir fermer la connection a la data base a la fin
var async = require('async');

exports.insertCodeReduction = function(test){
	test.done();
};

exports.delete = function(test){
	mongoose.connection.close();//On ferme la connection pour etre sur que nodeunit se ferme correctement
	test.done();
};