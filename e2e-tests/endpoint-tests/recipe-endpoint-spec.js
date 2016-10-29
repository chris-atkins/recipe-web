'use strict';

var rs = require('request-promise');
var Promise = require('bluebird');
var config = browser.params;
var dataUtils = require('./../utils/data-utils');

describe('the endpoint', function() {

	var listOfRecipeIdsToCleanUp = [];
	var userId;
	
	beforeAll(function(done) {
		var email = dataUtils.randomEmail();
		var user = {userName: 'ohai', userEmail: email};
		
		dataUtils.postUser(user).then(function(user) {
			userId = user.userId;
		}).then(done);
	});
	
	afterAll(function(done) {
		cleanUpTestRecipesThatHaveBeenPosted()
		.then(function() {done();});
	});
	
	function cleanUpTestRecipesThatHaveBeenPosted() {
		var p = performRecipeListGET();
		for (var i = 0; i < listOfRecipeIdsToCleanUp.length; i++) {
			p = p.then(performRecipeDELETEFunction(listOfRecipeIdsToCleanUp[i]));
		}
		p = p.then(function(){
			listOfRecipeIdsToCleanUp = [];
		});
		
		return p;
	}
	
	function performRecipeListGET() {
		var getOptions = {
				uri : config.apiBaseUrl + '/recipe',
				headers : {
					'RequestingUser' : userId
				},
				json : true,
				simple: false //https://github.com/request/request-promise
		};
		return rs.get(getOptions);
	}
	
	function performRecipeListGETwithSearchString(searchString) {
		var getOptions = {
				uri : config.apiBaseUrl + '/recipe?searchString=' + searchString,
				headers : {
					'RequestingUser' : userId
				},
				json : true,
				simple: false //https://github.com/request/request-promise
		};
		return rs.get(getOptions);
	}
	
	function performRecipeListGETwithSearchStringFunction(searchString) {
		return function() {
			return performRecipeListGETwithSearchString(searchString);
		};
	}
	
	function performRecipePOST(recipeToPost, options) {
		var postOptions = {
			uri : config.apiBaseUrl + '/recipe',
			headers : {
				'Content-Type' : 'application/json',
				'Content-Length' : recipeToPost.length,
				'RequestingUser' : userId
			},
			json : true,
			body : recipeToPost,
			simple: false //https://github.com/request/request-promise
		};

		if (options && options.responseType && options.responseType === 'full') {
			postOptions.resolveWithFullResponse = true;
		}
		
		if (options && options.userId && options.userId === 'none') {
			delete postOptions.headers.RequestingUser;
		}
		
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

	function performRecipeGET(newRecipeId, options) {
		var requestingUserId = (options && options.userId) ? options.userId : userId;
		
		var getOptions = {
				uri : config.apiBaseUrl + '/recipe/' + newRecipeId,
				headers : {
					'RequestingUser' : requestingUserId
				},
				json : true,
				simple: false //https://github.com/request/request-promise
		};

		if (options && options.responseType && options.responseType === 'full') {
			getOptions.resolveWithFullResponse = true;
		}
		
		if (options && options.userId && options.userId === 'none') {
			delete getOptions.headers.RequestingUser;
		}
		
		return rs.get(getOptions);
	}
	
	function performRecipeDELETE(recipeId) {
		var deleteOptions = {
				uri : config.apiBaseUrl + '/recipe/' + recipeId,
				headers : {
					'RequestingUser' : userId
				},
				resolveWithFullResponse: true,
				simple: false //https://github.com/request/request-promise
		};
		return rs.del(deleteOptions);
	}

	function performRecipePUT(updatedRecipe, options) {
		var requestingUserId = (options && options.userId) ? options.userId : userId;
		var putOptions = {
			uri : config.apiBaseUrl + '/recipe/' + updatedRecipe.recipeId,
			headers : {
				'Content-Type' : 'application/json',
				'Content-Length' : updatedRecipe.length,
				'RequestingUser' : requestingUserId
			},
			json : true,
			body : updatedRecipe,
			simple: false //https://github.com/request/request-promise
		};

		if (options && options.responseType && options.responseType === 'full') {
			putOptions.resolveWithFullResponse = true;
		}

		if (options && options.userId && options.userId === 'none') {
			delete putOptions.headers.RequestingUser;
		}

		return rs.put(putOptions);
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
				expect(recipe.editable).toBe(true);
				done();
			});
		});
	
		it('will GET a recipe by id after it has been saved', function(done) {
			var newRecipe = {'recipeName' : 'hi again', 'recipeContent' : 'it is more of me'};
	
			performRecipePOST(newRecipe)
			.then(function(response) {
				return performRecipeGET(response.recipeId);
			})
			.then(function(recipe) {
				expect(recipe.recipeName).toBe('hi again');
				expect(recipe.recipeContent).toBe('it is more of me');
				done();
			});
		});

		it('can PUT a recipe to change the name and content after it has been saved', function(done) {
			var newRecipe = {'recipeName' : 'firstName', 'recipeContent' : 'firstContent'};
			var recipeId;

			performRecipePOST(newRecipe)
			.then(function(recipe) {
				recipeId = recipe.recipeId;
				recipe.recipeName = 'secondName';
				recipe.recipeContent = 'secondContent';
				return performRecipePUT(recipe, {responseType: 'full'});
			})
			.then(function(response) {
				expect(response.statusCode).toBe(200);
				return performRecipeGET(recipeId);
			})
			.then(function(recipe) {
				expect(recipe.recipeName).toBe('secondName');
				expect(recipe.recipeContent).toBe('secondContent');
				done();
			});
		});

		it('will return 404 Not Found when performing a GET with an unknown id', function(done) {
			var nonExistentRecipeId = -1;

			performRecipeGET(nonExistentRecipeId, {responseType: 'full'})
				.then(function(response) {
					expect(response.statusCode).toBe(404);
					done();
				});
		});
		
		it('will return 404 Not Found when performing a PUT with an unknown id', function(done) {
			var nonExistentRecipeId = -1;
			var recipe = {recipeId: nonExistentRecipeId, recipeName: 'name', recipeContent: 'content'};
			
			performRecipePUT(recipe, {responseType: 'full'})
			.then(function(response) {
				expect(response.statusCode).toBe(404);
				done();
			}); 
		});
		
		it('will DELETE an existing recipe', function(done) {
			var newRecipe = {'recipeName': 'the best name', 'recipeContent': 'some pretty good content'};
			
			performRecipePOST(newRecipe)
			.then(function(response) {
				return performRecipeGET(response.recipeId);
			})
			.then(function(recipe){
				expect(recipe.recipeName).toBe('the best name');
				return recipe.recipeId;
			})
			.then(performRecipeDELETEandReturnId)
			.then(function(recipeId) {
				return performRecipeGET(recipeId, {responseType: 'full'});
			})
			.then(function(response) {
				expect(response.statusCode).toBe(404);
				done();
			});
		});
		
		it('DELETE returns 204', function(done) {
			var newRecipe = {'recipeName': 'THE name', 'recipeContent': 'reasonably ok content'};
			
			performRecipePOST(newRecipe)
			.then(function(response) {
				return performRecipeGET(response.recipeId);
			})
			.then(function(recipe) {return recipe.recipeId;})
			.then(performRecipeDELETE)
			.then(function(response) {
				expect(response.statusCode).toBe(204);
				done();
			});
		});
		
		describe('authentication', function() {
			
			it('will respond with editable set to true when a recipe is POSTed with a user id', function(done) {
				var recipe = {'recipeName': 'The greatest recipe ever', 'recipeContent': 'believe me'};
				
				performRecipePOST(recipe).then(function(response) {
					expect(response.editable).toBe(true);
				}).then(done);
			});
			
			it('will not allow a POST without a user id in the header and will respond with 401', function(done) {
				var recipe = {'recipeName': 'The most bigly recipe ever', 'recipeContent': 'believe me'};
				
				performRecipePOST(recipe, {responseType: 'full', userId: 'none'})
				.then(function(response) {
					expect(response.statusCode).toBe(401);
				}).then(done);
			});
			
			it('will respond with editable set to true when a GET is performed on a recipe that was ' +
							'created with the same user that is making the GET request', function(done) {
				var newRecipe = {'recipeName' : 'bigly', 'recipeContent' : 'the bigliest'};
				
				performRecipePOST(newRecipe)
				.then(function(response) {
					return performRecipeGET(response.recipeId);
				})
				.then(function(recipe) {
					expect(recipe.editable).toBe(true);
				}).then(done);
			});
			
			it('will respond with editable set to false if a GET is performe on a recipe that was ' + 
					'created with a different user than made the GET request', function(done) {
				var user = {userName: 'ohai', userEmail: dataUtils.randomEmail()};
				var recipe = {'recipeName': 'The greatest recipe ever', 'recipeContent': 'believe me'};
				
				Promise.props({
					recipe: performRecipePOST(recipe),
					newUser: dataUtils.postUser(user)
				}).then(function(props) {
					return performRecipeGET(props.recipe.recipeId, {userId: props.newUser.userId});
				}).then(function(response) {
					expect(response.recipeName).toBe('The greatest recipe ever');
					expect(response.recipeContent).toBe('believe me');
					expect(response.editable).toBe(false);
				}).then(done);
			});
			
			it('GET will respond with editable set to false with no userId set in the header', function(done) {
				var newRecipe = {'recipeName' : 'bigly', 'recipeContent' : 'the bigliest'};

				performRecipePOST(newRecipe)
				.then(function(response) {
					return performRecipeGET(response.recipeId, {userId: 'none'});
				})
				.then(function(recipe) {
					expect(recipe.editable).toBe(false);
				}).then(done);
			});

			it('will not allow a PUT without a user id in the header and will respond with 401', function(done) {
				var recipe = {'recipeName': 'name', 'recipeContent': 'content'};

				performRecipePOST(recipe)
					.then(function(response) {
						response.recipeContent = 'newContent';
						return performRecipePUT(response,  {responseType: 'full', userId: 'none'});
					})
					.then(function(response) {
						expect(response.statusCode).toBe(401);
					})
					.then(done);
			});

			it('will not allow a PUT with a user id that is not the creator of the original recipe and will respond with 401', function(done) {
				var recipe = {'recipeName': 'name', 'recipeContent': 'content'};

				performRecipePOST(recipe)
					.then(function(response) {
						response.recipeContent = 'newContent';
						return performRecipePUT(response,  {responseType: 'full', userId: '576b339ea7c0a0146aba1337'});
					})
					.then(function(response) {
						expect(response.statusCode).toBe(401);
					})
					.then(done);
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
