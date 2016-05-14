var express = require('express');

var http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var rs = require('request-promise');

var serviceIp = process.env.SERVICE_IP || '127.0.0.1';
var webIp = process.env.WEB_IP || 'localhost';
var serviceRoot = 'http://' + serviceIp + ':5555/api';
var port = process.env.PORT || '8000';

var app = express();

app.set('port', port);
app.use(express.static(path.join(__dirname, 'app')));
app.use(bodyParser.urlencoded({extended: 'true'}));
app.use(bodyParser.json());

function performRecipeListGET(searchString) {
	var uri = serviceRoot + '/recipe';
	if (searchString) {
		uri += '?searchString=' + searchString;
	}
	var getOptions = {
		uri : uri,
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

function performRecipePOST(recipe) {
	var postOptions = {
		uri : serviceRoot + '/recipe',
		headers : {
			'Content-Type' : 'application/json',
			'Content-Length' : recipe.length
		},
		json : true,
		body : recipe,
		simple: false
	};
	return rs.post(postOptions);
}

app.get('/api/recipe', function(request, response, next) {
	performRecipeListGET(request.query.searchString).then(function(data) {
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

app.post('/api/recipe', function(request, response, next) {
	var recipe = request.body;
	performRecipePOST(recipe).then(function(data) {
		response.json(data);
	})
	.caught(function(error) {
		console.log('Error posting a new recipe:', recipe, 'Error:', error);
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});