var express = require('express');

var http = require('http');
var path = require('path');
var bodyParser = require('body-parser')
var rs = require('request-promise');

var serviceIp = process.env.SERVICE_IP || '127.0.0.1'
var serviceRoot = 'http://' + serviceIp + ':8080/api'

var app = express();

app.set('port', process.env.PORT || 8000);
app.use(express.static(path.join(__dirname, 'app')));
app.use(bodyParser.urlencoded({extended: 'true'}));
app.use(bodyParser.json());


function performRecipeListGET() {
	var getOptions = {
			uri : serviceRoot + '/recipe',
			json : true,
			simple: false
	}
	return rs.get(getOptions);
}

function performRecipeGET(recipeId) {
	var getOptions = {
			uri : serviceRoot + '/recipe/' + recipeId,
			json : true,
			simple: false
	}
	return rs.get(getOptions);
}

app.get('/api/recipe', function(request, response, next) {
	performRecipeListGET().then(function(data) {
			response.json(data);
		})
		.caught(function(error) {
			console.log('Error getting recipes: ', error);
		});
});

app.get('/api/recipe/:recipeId', function(request, response, next) {
	var recipeId = request.params.recipeId;
	performRecipeGET(recipeId).then(function(data) {
		response.json(data);
	})
	.caught(function(error) {
		console.log('Error getting recipe with id ' + recipeId + ': ', error);
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});