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
			body : recipeToPost
		};
		return rs.post(postOptions)
	}

	function performRecipeGET(newRecipeId) {
		var getOptions = {
			uri : config.apiBaseUrl + '/recipe/' + newRecipeId,
			json : true
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
});
