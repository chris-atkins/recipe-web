'use strict';

var rs = require('request-promise');
var config = browser.params;

describe('the endpoint', function() {

	var listOfRecipeIdsToCleanUp = [];
	
	afterAll(function(done) {
		cleanUpTestRecipesThatHaveBeenPosted()
		.then(function() {done();})
	});
	
	function cleanUpTestRecipesThatHaveBeenPosted() {
		var p = performRecipeListGET();
		for (var i = 0; i < listOfRecipeIdsToCleanUp.length; i++) {
			p = p.then(performRecipeDELETEFunction(listOfRecipeIdsToCleanUp[i]));
		}
		p = p.then(function(response){
			listOfRecipeIdsToCleanUp = [];
		});
		
		return p;
	}
	
	function performRecipeListGET() {
		var getOptions = {
				uri : config.apiBaseUrl + '/recipe',
				json : true,
				simple: false //https://github.com/request/request-promise
		}
		return rs.get(getOptions);
	}
	
	function performRecipeListGETwithSearchString(searchString) {
		var getOptions = {
				uri : config.apiBaseUrl + '/recipe?searchString=' + searchString,
				json : true,
				simple: false //https://github.com/request/request-promise
		}
		return rs.get(getOptions);
	}
	
	function performRecipeListGETwithSearchStringFunction(searchString) {
		return function() {
			return performRecipeListGETwithSearchString(searchString);
		}
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
	
	function performRecipePOSTFunction(recipeToPost) {
		return function() {
			return performRecipePOST(recipeToPost);
		};
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
	
	
	function performRecipeDELETEFunction(recipeId) {
		return function() {
			return performRecipeDELETE(recipeId);
		};
	}
	
	
	function performRecipeDELETEandReturnId(recipeId) {
		return performRecipeDELETE(recipeId).then(function(){return recipeId;});
	}
	
	describe('/recipe/{id}', function(){
	
		it('will save with a post and return the saved object with id populated', function(done) {
			var newRecipe = {'recipeName' : 'hi', 'recipeContent' : 'it is me'};
	
			performRecipePOST(newRecipe).then(function(recipe) {
				expect(recipe.recipeName).toBe('hi');
				expect(recipe.recipeContent).toBe('it is me');
				expect(recipe.recipeId).not.toBe(null);
				done();
			});
		});
	
		it('will GET a recipe by id after it has been saved', function(done) {
			var newRecipe = {'recipeName' : 'hi again', 'recipeContent' : 'it is more of me'};
	
			performRecipePOST(newRecipe).then(function(response) { return response.recipeId;})
			.then(performRecipeGET).then(function(recipe) {
				expect(recipe.recipeName).toBe('hi again');
				expect(recipe.recipeContent).toBe('it is more of me')
				done();
			});
		});
		
		it('will return 404 Not Found when performing a GET with an unknown id', function(done) {
			var nonExistentRecipeId = -1;
			
			performRecipeGET(nonExistentRecipeId, 'fullResponse').then(function(response) {
				expect(response.statusCode).toBe(404);
				done();
			}); 
		});
		
		it('will DELETE an existing recipe', function(done) {
			var newRecipe = {'recipeName': 'the best name', 'recipeContent': 'some pretty good content'};
			
			performRecipePOST(newRecipe).then(function(response) {return response.recipeId;})
			.then(performRecipeGET).then(function(recipe){
				expect(recipe.recipeName).toBe('the best name');
				return recipe.recipeId;
			})
			.then(performRecipeDELETEandReturnId) 
			.then(performRecipeGETandReturnFullResponse).then(function(response) {
				expect(response.statusCode).toBe(404);
				done();
			});
		});
		
		it('DELETE returns 204', function(done) {
			var newRecipe = {'recipeName': 'THE name', 'recipeContent': 'reasonably ok content'};
			
			performRecipePOST(newRecipe).then(function(response) {return response.recipeId;})
			.then(performRecipeGET).then(function(recipe) {return recipe.recipeId;})
			.then(performRecipeDELETE)
			.then(function(response) {
				expect(response.statusCode).toBe(204);
				done();
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
			var firstRecipe = {'recipeName' : 'first', 'recipeContent': 'firstContent'};
			var secondRecipe = {'recipeName' : 'second', 'recipeContent': 'secondContent'};
			
			performRecipePOST(firstRecipe).then(function(){})
			.then(performRecipePOSTFunction(secondRecipe))
			.then(performRecipeListGET)
			.then(function(response){
				expect(response.length).toBeGreaterThan(1);
				expect(responseContainsRecipe(response, firstRecipe)).toBe(true);
				expect(responseContainsRecipe(response, secondRecipe)).toBe(true);
				done();
			});
		});
		
		it('GET with a search string returns only matching recipes', function(done) {
			var firstRecipe = {'recipeName' : 'Search First ThisOne', 'recipeContent': 'this one should be included'};
			var secondRecipe = {'recipeName' : 'Search second', 'recipeContent': 'I should not be in the response'};
			var thirdRecipe = {'recipeName' : 'Search third', 'recipeContent': 'I should definitely be find'};
			var searchString = 'fiNd%20thisONE';
				
			cleanUpTestRecipesThatHaveBeenPosted()
			.then(performRecipePOSTFunction(firstRecipe))
			.then(performRecipePOSTFunction(secondRecipe))
			.then(performRecipePOSTFunction(thirdRecipe))
			
			.then(performRecipeListGETwithSearchStringFunction(searchString))
			.then(function(response) {
				expect(response.length).toBeGreaterThan(1);
				expect(responseContainsRecipe(response, firstRecipe)).toBe(true);
				expect(responseContainsRecipe(response, thirdRecipe)).toBe(true);
				
				expect(responseContainsRecipe(response, secondRecipe)).toBe(false);
				done();
			});
		});
	});
});
