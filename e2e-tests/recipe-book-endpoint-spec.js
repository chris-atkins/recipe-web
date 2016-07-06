'use strict';
var dataUtils = require('./data-utils');
var config = browser.params;
var rs = require('request-promise');

describe('the Recipe Book endpoints', function() {

	var listOfRecipeIds = [];
	var userId;

	var recipe1 = {
		recipeName: 'First Recipe Name',
		recipeContent: 'First Recipe Content findMe'
	};
	var recipe2 = {
		recipeName: 'Second Recipe Name findMe',
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
		.then(done);
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

	it('can POST a recipe into a users recipe book', function(done) {
		var recipeIdToPost = {recipeId: listOfRecipeIds[0]};
		performRecipeBookPOSTRecipe(recipeIdToPost, {responseType: 'full'})
		.then(function(response) {
			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual(recipeIdToPost);
		})
		.then(done);
	});

	it('posted recipe ids will be returned from the recipe book GET', function() {
		// [{recipeId: 'id'}, {recipeId: 'id'}]
	});

	it('the recipe endpoint can return recipes from a specific users recipe book', function() {
		// get('recipe?recipeBook=userId');
	});

	describe('authorization', function() {

		it('attempting to POST into a users recipe book using a different user will return 401, and will not add the recipe', function() {

		});
	});
});