'use strict';

var http = require('http');
var rs = require('request-promise');
var _ = require('underscore');
var config = browser.params;

var listOfRecipeIdsToCleanUp = [];

var addRecipes = function(recipeArray) {
	var p = postRecipe(recipeArray[0]);
	for (var i = 1; i < recipeArray.length; i++) {
		p = p.then(postRecipeFunction(recipeArray[i]));
	}
	p = p.then(function(response){
		return;
	});
	
	return p;
}

function postRecipe(recipe) {
	var postOptions = {
		uri : config.apiBaseUrl + '/recipe',
		headers : {
			'Content-Type' : 'application/json',
			'Content-Length' : recipe.length
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

function postRecipeFunction(recipeToPost) {
	return function() {
		return postRecipe(recipeToPost);
	};
}

var cleanupData = function(done) {
	cleanUpTestRecipesThatHaveBeenPosted()
		.then(function(){done();});
}

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
}

function performRecipeListGET() {
	var getOptions = {
			uri : config.apiBaseUrl + '/recipe',
			json : true,
			simple: false //https://github.com/request/request-promise
	}
	return rs.get(getOptions);
}

function performRecipeDELETE(recipeId) {
	var deleteOptions = {
			uri : config.apiBaseUrl + '/recipe/' + recipeId,
			resolveWithFullResponse: true,
			simple: false //https://github.com/request/request-promise
	}
	return rs.del(deleteOptions);
}

function performRecipeDELETEFunction(recipeId) {
	return function() {
		return performRecipeDELETE(recipeId);
	};
}

module.exports = {
	addRecipe: postRecipe,
	addRecipes: addRecipes,
	cleanupData: cleanupData, 
	removeAllRecipeData: removeAllRecipeData
}