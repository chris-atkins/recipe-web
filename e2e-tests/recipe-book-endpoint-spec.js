'use strict';
var dataUtils = require('./data-utils');
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

		if (options && options.userId && options.userId === 'none') {
			delete postOptions.headers.RequestingUser;
		} else if (options && options.userId) {
			postOptions.headers.RequestingUser = options.userId;
		}

		return rs.post(postOptions).then(function(response){
			return response;
		});
	}

	function performRecipeBookGET(options) {
		var getOptions = {
			uri : config.apiBaseUrl + '/user/' + userId + '/recipe-book',
			json : true,
			simple: false //https://github.com/request/request-promise
		};

		if (options && options.responseType && options.responseType === 'full') {
			getOptions.resolveWithFullResponse = true;
		}

		return rs.get(getOptions);
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

	it('POSTing a recipeId that does not exist to a recipe book returns 403', function() {

	});

	it('POSTing a recipeId that is invalid to a recipe book returns 403', function() {

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

	it('the recipe endpoint will return with an empty recipe book if no user is found by the given id', function() {

	});

	describe('authorization', function() {

		it('attempting to POST into a users recipe book using a different user will return 401, and will not add the recipe', function() {

		});
	});
});