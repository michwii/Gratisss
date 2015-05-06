var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render(__dirname + '/view/index.ejs');
});

var server = app.listen(80, function(){
	console.log("The server has been launched");
});
