'use strict';
var dataUtils = require('./../utils/data-utils');
var config = browser.params;
var rs = require('request-promise');

describe('the Recipe Book endpoints', function() {

	var listOfRecipeIds = [];
	var userId;

	var recipe1 = {
		recipeName: 'First Recipe Name',
		recipeContent: 'First Recipe Content'
	};
	var recipe2 = {
		recipeName: 'Second Recipe Name',
		recipeContent: 'Second Recipe Content'
	};
	var recipe3 = {
		recipeName: 'Third Recipe Name',
		recipeContent: 'Third Recipe Content'
	};

	beforeAll(function(done) {
		var email = dataUtils.randomEmail();
		var user = {userName: 'ohai', userEmail: email};

		dataUtils.postUser(user)
		.then(function(user) {
			userId = user.userId;
			return dataUtils.addRecipe(recipe1, user.userId);
		})
		.then(function(recipe) {
			listOfRecipeIds.push(recipe.recipeId);
			return dataUtils.addRecipe(recipe2, userId);
		})
		.then(function(recipe) {
			listOfRecipeIds.push(recipe.recipeId);
			return dataUtils.addRecipe(recipe3, userId);
		})
		.then(function(recipe) {
			listOfRecipeIds.push(recipe.recipeId);
		})
		.then(done, done.fail);
	});

	afterAll(function(done) {
		dataUtils.cleanupData(done);
	});

	function performRecipeBookPOSTRecipe(recipeIdToPost, options) {
		var postOptions = {
			uri : config.apiBaseUrl + '/user/' + userId + '/recipe-book',
			headers : {
				'Content-Type' : 'application/json',
				'Content-Length' : recipeIdToPost.length,
				'RequestingUser' : userId
			},
			json : true,
			body : recipeIdToPost,
			simple: false //https://github.com/request/request-promise
		};

		if (options && options.responseType && options.responseType === 'full') {
			postOptions.resolveWithFullResponse = true;
		}

		if (options && options.userId && options.authUserId === 'none') {
			delete postOptions.headers.RequestingUser;
		} else if (options && options.authUserId) {
			postOptions.headers.RequestingUser = options.authUserId;
		}

		return rs.post(postOptions).then(function(response){
			return response;
		});
	}

	function performRecipeBookGET(options) {
		var userIdToUse = options && options.userId ? options.userId : userId;
		var getOptions = {
			uri : config.apiBaseUrl + '/user/' + userIdToUse + '/recipe-book',
			json : true,
			simple: false //https://github.com/request/request-promise
		};

		if (options && options.responseType && options.responseType === 'full') {
			getOptions.resolveWithFullResponse = true;
		}

		return rs.get(getOptions);
	}

	function performRecipeBookDELETERecipe(userId, recipeId, options) {
		var deleteOptions = {
			uri : config.apiBaseUrl + '/user/' + userId + '/recipe-book/' + recipeId,
			headers : {
				'RequestingUser' : userId
			},
			json : true,
			simple: false //https://github.com/request/request-promise
		};

		if (options && options.responseType && options.responseType === 'full') {
			deleteOptions.resolveWithFullResponse = true;
		}

		if (options && options.userId && options.authUserId === 'none') {
			delete deleteOptions.headers.RequestingUser;
		} else if (options && options.authUserId) {
			deleteOptions.headers.RequestingUser = options.authUserId;
		}

		return rs.del(deleteOptions);
	}

	function performRecipeListGETByUserRecipeBook(userId) {
		var getOptions = {
			uri : config.apiBaseUrl + '/recipe?recipeBook=' + userId,
			json : true,
			simple: false //https://github.com/request/request-promise
		};
		return rs.get(getOptions);
	}

	it('can POST a recipe into a users recipe book', function(done) {
		var recipeIdToPost = {recipeId: listOfRecipeIds[0]};
		performRecipeBookPOSTRecipe(recipeIdToPost, {responseType: 'full'})
		.then(function(response) {
			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual(recipeIdToPost);
		})
		.then(done, done.fail);
	});

	it('posted recipe ids will be returned from the recipe book GET', function(done) {
		performRecipeBookPOSTRecipe({recipeId: listOfRecipeIds[0]})
		.then(function() {
			return performRecipeBookPOSTRecipe({recipeId: listOfRecipeIds[1]});
		})
		.then(function() {
			return performRecipeBookGET({responseType: 'full'});
		})
		.then(function(response) {
			expect(response.statusCode).toBe(200);
			var body = response.body;
			expect(body.length).toBe(2);
			expect(body).toContain({recipeId: listOfRecipeIds[0]});
			expect(body).toContain({recipeId: listOfRecipeIds[1]});
		})
		.then(done, done.fail);
	});

	it('the recipe endpoint can return recipes from a specific users recipe book', function(done) {
		performRecipeBookPOSTRecipe({recipeId: listOfRecipeIds[0]})
		.then(function() {
			return performRecipeBookPOSTRecipe({recipeId: listOfRecipeIds[1]});
		})
		.then(function() {
			return performRecipeListGETByUserRecipeBook(userId);
		})
		.then(function(response) {
			expect(response.length).toBe(2);

			var recipe1 = response[0];
			expect(recipe1.recipeId).toBe(listOfRecipeIds[0]);
			expect(recipe1.recipeName).toBe('First Recipe Name');
			expect(recipe1.recipeContent).toBe('First Recipe Content');

			var recipe2 = response[1];
			expect(recipe2.recipeId).toBe(listOfRecipeIds[1]);
			expect(recipe2.recipeName).toBe('Second Recipe Name');
			expect(recipe2.recipeContent).toBe('Second Recipe Content');
		})
		.then(done, done.fail);
	});

	it('a recipe can be DELETED from a recipe book', function(done) {
		var sizeWithAllIds;
		var recipeIdToDelete = listOfRecipeIds[2];

		performRecipeBookPOSTRecipe({recipeId: recipeIdToDelete})
		.then(function() {
			return performRecipeListGETByUserRecipeBook(userId);
		})
		.then(function(response) {
			sizeWithAllIds = response.length;
		})
		.then(function() {
			return performRecipeBookDELETERecipe(userId, recipeIdToDelete, {responseType: 'full'});
		})
		.then(function(response) {
			expect(response.statusCode).toBe(204);
			return performRecipeListGETByUserRecipeBook(userId);
		})
		.then(function(response) {
			expect(response.length).toBe(sizeWithAllIds - 1);

			for (var i = 0; i < response.length; i++) {
				expect(response[i].recipeId).not.toBe(recipeIdToDelete);
			}
		})
		.then(done, done.fail);
	});

	describe('authorization', function() {

		it('attempting to POST into a users recipe book using a different user will return 401, and will not add the recipe', function(done) {

			performRecipeBookPOSTRecipe({recipeId: listOfRecipeIds[2]}, {authUserId: '577d1a8e3dcc7d0c76cb72d0', responseType: 'full'})
			.then(function(response) {
				expect(response.statusCode).toBe(401);
			})
			.then(function() {
				return performRecipeBookGET();
			})
			.then(function(recipeBook) {
				expect(recipeBook).not.toContain({recipeId: listOfRecipeIds[2]});
			})
			.then(done, done.fail);
		});

		it('attempting to POST into a users recipe book with no user will return 401, and will not add the recipe', function(done) {

			performRecipeBookPOSTRecipe({recipeId: listOfRecipeIds[2]}, {authUserId: 'none', responseType: 'full'})
			.then(function(response) {
				expect(response.statusCode).toBe(401);
			})
			.then(function() {
				return performRecipeBookGET();
			})
			.then(function(recipeBook) {
				expect(recipeBook).not.toContain({recipeId: listOfRecipeIds[2]});
			})
			.then(done, done.fail);
		});

		it('attempting to DELETE a recipe from a recipe book, if the user does not own the recipe book, will return 401 and will not delete the recipe', function(done) {
			performRecipeBookPOSTRecipe({recipeId: listOfRecipeIds[0]})
			.then(function() {
				return performRecipeBookDELETERecipe(userId, listOfRecipeIds[0], {authUserId: '577d1a8e3dcc7d0c76cb72d0', responseType: 'full'});
			})
			.then(function(response) {
				expect(response.statusCode).toBe(401);
			})
			.then(function() {
				return performRecipeBookGET();
			})
			.then(function(recipeBook) {
				expect(recipeBook).toContain({recipeId: listOfRecipeIds[0]});
			})
			.then(done, done.fail);
		});

		it('attempting to DELETE a recipe from a recipe book, if no user is logged in, will return 401 and will not delete the recipe', function(done) {
			performRecipeBookPOSTRecipe({recipeId: listOfRecipeIds[0]})
			.then(function() {
				return performRecipeBookDELETERecipe(userId, listOfRecipeIds[0], {authUserId: 'none', responseType: 'full'});
			})
			.then(function(response) {
				expect(response.statusCode).toBe(401);
			})
			.then(function() {
				return performRecipeBookGET();
			})
			.then(function(recipeBook) {
				expect(recipeBook).toContain({recipeId: listOfRecipeIds[0]});
			})
			.then(done, done.fail);
		});
	});

	describe('edge cases', function() {

		it('POSTing a recipeId that does not exist to a recipe book returns with success, and will add the fake id to the recipe list, ' +
			'but wont return from getRecipeBook', function(done) {

			var fakeRecipeId = '577d1a8e3dcc7d0c76cb72d0';
			var originalRecipeBookCount;

			performRecipeListGETByUserRecipeBook(userId)
			.then(function(response) {
				originalRecipeBookCount = response.length;
				return performRecipeBookPOSTRecipe({recipeId: fakeRecipeId}, {responseType: 'full'});
			})
			.then(function(response) {
				expect(response.statusCode).toBe(200);
				return performRecipeBookGET();
			})
			.then(function(recipeList) {
				expect(recipeList[recipeList.length - 1].recipeId).toBe(fakeRecipeId);
				return performRecipeListGETByUserRecipeBook(userId);
			})
			.then(function(recipes) {
				expect(recipes.length).toBe(originalRecipeBookCount);
			})
			.then(done, done.fail);
		});

		it('POSTing a recipeId that is an invalid objectId to a recipe book returns 400', function(done) {
			performRecipeBookPOSTRecipe({recipeId: 'hi'}, {responseType: 'full'})
			.then(function(response) {
				expect(response.statusCode).toBe(400);
			})
			.then(done, done.fail);
		});

		it('the recipe-book endpoint will return with an empty recipe book if no user is found by the given id', function(done) {
			performRecipeBookGET({userId: '577d1a8e3dcc7d0c76cb72d0'})
			.then(function(response) {
				expect(response).toEqual([]);
			})
			.then(done, done.fail);
		});

		it('the recipe-book endpoint will return with an empty recipe book if the user id is bad', function(done) {
			performRecipeBookGET({userId: 'badUserId'})
			.then(function(response) {
				expect(response).toEqual([]);
			})
			.then(done, done.fail);
		});

		it('attempting to DELETE a recipe that does not exist in a recipe book, will return 404', function(done) {
			var unknownRecipeId = '577d1a8e3dcc7d0c76cb72d1';
			performRecipeBookDELETERecipe(userId, unknownRecipeId, {responseType: 'full'})
			.then(function(response) {
				expect(response.statusCode).toBe(404);
			})
			.then(done, done.fail);
		});
	});
});