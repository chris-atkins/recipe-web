'use strict';

var http = require('http');
var rs = require('request-promise');
var _ = require('underscore');
var config = browser.params;

var listOfRecipeIdsToCleanUp = [];

var addRecipes = function(recipeArray, userId) {
	var p = postRecipe(recipeArray[0], userId);
	for (var i = 1; i < recipeArray.length; i++) {
		p = p.then(postRecipeFunction(recipeArray[i], userId));
	}
	p = p.then(function(response){
		return;
	});
	
	return p;
};

function postRecipe(recipe, userId) {
	var postOptions = {
		uri : config.apiBaseUrl + '/recipe',
		headers : {
			'Content-Type' : 'application/json',
			'Content-Length' : recipe.length,
			'RequestingUser' : userId
		},
		json : true,
		body : recipe,
		simple: false //https://github.com/request/request-promise
	};
	return rs.post(postOptions).then(function(response){
		listOfRecipeIdsToCleanUp.push(response.recipeId);
		return response;
	});
}

function postUser(userToPost) {
	var postOptions = {
		uri : config.apiBaseUrl + '/user',
		headers : {
			'Content-Type' : 'application/json',
			'Content-Length' : userToPost.length
		},
		json : true,
		body : userToPost,
		simple: false
	};
	
	return rs.post(postOptions);
}

function postRecipeFunction(recipeToPost, userId) {
	return function() {
		return postRecipe(recipeToPost, userId);
	};
}

var cleanupData = function(done) {
	done();
	cleanUpTestRecipesThatHaveBeenPosted()
		.then(function(){done();});
};

function cleanUpTestRecipesThatHaveBeenPosted() {
	var p = cleanUpTestRecipes(listOfRecipeIdsToCleanUp);
	p = p.then(function(response){
		listOfRecipeIdsToCleanUp = [];
	});
	return p;
}

function cleanUpTestRecipes(recipeIds) {
	var p = performRecipeListGET();
	for (var i = 0; i < recipeIds.length; i++) {
		p = p.then(performRecipeDELETEFunction(recipeIds[i]));
	}
	return p;
}

var removeAllRecipeData = function(done) {
	performRecipeListGET().then(function(recipeList) {
		var recipeIds = _.map(recipeList, function(recipe) {
			return recipe.recipeId;
		});
		cleanUpTestRecipes(recipeIds).then(function(){done();});
	});
};

function performRecipeListGET(userId) {
	var getOptions = {
			uri : config.apiBaseUrl + '/recipe',
			headers : {
				'RequestingUser' : userId
			},
			json : true,
			simple: false
	};
	return rs.get(getOptions);
}

function performRecipeDELETE(recipeId) {
	var deleteOptions = {
			uri : config.apiBaseUrl + '/recipe/' + recipeId,
			resolveWithFullResponse: true,
			simple: false
	};
	return rs.del(deleteOptions);
}

function performRecipeDELETEFunction(recipeId) {
	return function() {
		return performRecipeDELETE(recipeId);
	};
}

function addRecipeToRecipeBook(recipeId, userId) {
	var recipeIdToPost = {recipeId: recipeId};
	var postOptions = {
		uri : config.apiBaseUrl + '/user/' + userId + '/recipe-book',
		headers : {
			'Content-Type' : 'application/json',
			'Content-Length' : recipeIdToPost.length,
			'RequestingUser' : userId
		},
		json : true,
		body : recipeIdToPost,
		simple: false
	};

	return rs.post(postOptions);
}

function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function randomEmail() {
	var length = Math.floor(Math.random() * 10) + 15;
	return randomString(length);
}

module.exports = {
	addRecipe: postRecipe,
	addRecipes: addRecipes,
	postUser: postUser,
	cleanupData: cleanupData,
	removeAllRecipeData: removeAllRecipeData,
	randomEmail: randomEmail,
	addRecipeToRecipeBook: addRecipeToRecipeBook
};