'use strict';

var http = require('http');
var rs = require('request-promise');
var config = browser.params;

describe('the /recipe endpoint', function() {

	function performRecipePOST(recipeToPost) {
		var postOptions = {
			uri : config.apiBaseUrl + '/recipe',
			headers : {
				'Content-Type' : 'application/json',
				'Content-Length' : recipeToPost.length
			},
			json : true,
			body : recipeToPost,
			simple: false //https://github.com/request/request-promise
		};
		return rs.post(postOptions)
	}

	function performRecipeGET(newRecipeId, typeOfResponse) {
		var getOptions = {
				uri : config.apiBaseUrl + '/recipe/' + newRecipeId,
				json : true,
				simple: false //https://github.com/request/request-promise
		}
		
		if (typeOfResponse && typeOfResponse === 'fullResponse') {
			getOptions.resolveWithFullResponse = true;
		}
		
		return rs.get(getOptions);
	}
	
	it('will save with a post and return the saved object with id populated', function() {
		var newRecipe = JSON.stringify({'recipeName' : 'hi', 'recipeContent' : 'it is me'});

		performRecipePOST(newRecipe)
		.then(function(recipe) {
			expect(recipe.recipeName).toBe('hi');
			expect(recipe.recipeContent).toBe('it is me');
			expect(recipe.recipeId).not.toBe(null);
		});
	});

	it('will GET a recipe by id after it has been saved', function() {
		var newRecipe = JSON.stringify({'recipeName' : 'hi again', 'recipeContent' : 'it is more of me'});

		performRecipePOST(newRecipe)
		.then(function(response) { return response.recipeId;})
		.then(performRecipeGET)
		.then(function(recipe) {
			expect(recipe.recipeName).toBe('hi again');
			expect(recipe.recipeContent).toBe('it is more of me')
		});
	});
	
	it('will return 404 Not Found when performing a GET with an unknown id', function() {
		var nonExistentRecipeId = -1;
		
		performRecipeGET(nonExistentRecipeId, 'fullResponse').then(function(response) {
			expect(response.statusCode).toBe(404);
		}); 
	});
});
