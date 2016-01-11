'use strict';

var http = require('http');
var rs = require('request-promise');
var config = browser.params;

describe('the endpoint', function() {

	var listOfRecipeIdsToCleanUp = [];
	
	function performRecipeListGET() {
		var getOptions = {
				uri : config.apiBaseUrl + '/recipe',
				json : true,
				simple: false //https://github.com/request/request-promise
		}
		return rs.get(getOptions);
	}
	
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
		return rs.post(postOptions).then(function(response){
			listOfRecipeIdsToCleanUp.push(response.recipeId);
			return response;
		});
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
	
	function performRecipeGETandReturnFullResponse(recipeId) {
		return performRecipeGET(recipeId, 'fullResponse');
	}
	
	function performRecipeDELETE(recipeId) {
		var deleteOptions = {
				uri : config.apiBaseUrl + '/recipe/' + recipeId,
				resolveWithFullResponse: true,
				simple: false //https://github.com/request/request-promise
		}
		return rs.del(deleteOptions);
	}
	
	function performRecipeDELETEandReturnId(recipeId) {
		performRecipeDELETE(recipeId).then(function(){return recipeId;});
	}
	
	describe('/recipe/{id}', function(){
	
		it('will save with a post and return the saved object with id populated', function() {
			var newRecipe = JSON.stringify({'recipeName' : 'hi', 'recipeContent' : 'it is me'});
	
			performRecipePOST(newRecipe).then(function(recipe) {
				expect(recipe.recipeName).toBe('hi');
				expect(recipe.recipeContent).toBe('it is me');
				expect(recipe.recipeId).not.toBe(null);
			});
		});
	
		it('will GET a recipe by id after it has been saved', function() {
			var newRecipe = JSON.stringify({'recipeName' : 'hi again', 'recipeContent' : 'it is more of me'});
	
			performRecipePOST(newRecipe).then(function(response) { return response.recipeId;})
			.then(performRecipeGET).then(function(recipe) {
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
		
		it('will DELETE an existing recipe', function() {
			var newRecipe = JSON.stringify({'recipeName': 'the best name', 'recipeContent': 'some pretty good content'});
			
			performRecipePOST(newRecipe).then(function(response) {return response.recipeId;})
			.then(performRecipeGET).then(function(recipe){
				expect(recipe.recipeName).toBe('the best name');
				return recipe.recipeId;
			})
			.then(performRecipeDELETEandReturnId) 
			.then(performRecipeGETandReturnFullResponse).then(function(response) {
				expect(response.statusCode).toBe(404);
			});
		});
		
		it('DELETE returns 204', function() {
			var newRecipe = JSON.stringify({'recipeName': 'THE name', 'recipeContent': 'reasonably ok content'});
			
			performRecipePOST(newRecipe).then(function(response) {return response.recipeId;})
			.then(performRecipeGET).then(function(recipe) {return recipe.recipeId;})
			.then(performRecipeDELETE)
			.then(function(response) {
				expect(response.statusCode).toBe(204);
			});
		});
	});
	
	describe('/recipe', function() {
		
		function responseContainsRecipe(response, recipe) {
			var item;
			for (var i = 0; i < response.length; i++) {
				item = response[i];
				if (item.recipeName === recipe.recipeName && item.recipeContent === recipe.recipeContent)
					return true; 
			}
			return false;
		}
		
		it('GET returns all recipes that have been saved', function(done) {
			var firstRecipeObject = {'recipeName' : 'first', 'recipeContent': 'firstContent'};
			var secondRecipeObject = {'recipeName' : 'second', 'recipeContent': 'secondContent'};
			var firstRecipe = JSON.stringify(firstRecipeObject);
			var secondRecipe = JSON.stringify(secondRecipeObject);
			
			performRecipePOST(firstRecipe)
			.then(function(){})
			.then(performRecipePOST(secondRecipe))
			.then(performRecipeListGET)
			.then(function(response){
				expect(response.length).toBeGreaterThan(1);
				expect(responseContainsRecipe(response, firstRecipeObject)).toBe(true);
				expect(responseContainsRecipe(response, secondRecipeObject)).toBe(true);
				done();
			});
		});
	});
});
