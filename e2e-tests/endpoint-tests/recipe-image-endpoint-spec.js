'use strict';
var dataUtils = require('./../utils/data-utils');
var config = browser.params;
var rs = require('request-promise');
var fs = require('fs');

fdescribe('the Recipe Image endpoints', function () {

	var recipeId;
	var userId;

	var recipe1 = {
		recipeName: 'First Recipe Name',
		recipeContent: 'First Recipe Content'
	};

	beforeAll(function (done) {
		var email = dataUtils.randomEmail();
		var user = {userName: 'ohai', userEmail: email};

		dataUtils.postUser(user)
		.then(function (user) {
			userId = user.userId;
			return dataUtils.addRecipe(recipe1, user.userId);
		})
		.then(function (recipe) {
			recipeId = recipe.recipeId;
		})
		.then(done, done.fail);
	});

	afterAll(function (done) {
		dataUtils.cleanupData(done);
	});

	function performRecipeImagePOST(recipeId, options) {
		var postOptions = {
			uri: config.apiBaseUrl + '/recipe/' + recipeId + '/image',
			headers: {
				'RequestingUser': userId
			},
			json: true,
			formData: {
				'file': fs.createReadStream('e2e-tests/endpoint-tests/pexels-photo-48726.jpeg')
			},
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

		return rs.post(postOptions).then(function (response) {
			return response;
		});
	}

	function performDELETEImage(recipeId, imageId, options) {
		var deleteOptions = {
			uri: config.apiBaseUrl + '/recipe/' + recipeId + '/image/' + imageId,
			headers: {
				'RequestingUser': userId
			},
			json: true,
			simple: false
		};

		if (options && options.responseType && options.responseType === 'full') {
			deleteOptions.resolveWithFullResponse = true;
		}

		if (options && options.userId && options.authUserId === 'none') {
			delete deleteOptions.headers.RequestingUser;
		} else if (options && options.authUserId) {
			deleteOptions.headers.RequestingUser = options.authUserId;
		}

		return rs.delete(deleteOptions);
	}

	function performGETImage(url) {
		var getOptions = {
			uri: url,
			resolveWithFullResponse: true,
			simple: false
		};
		return rs.get(getOptions);
	}

	var imageUrl = "";
	var imageId = "";

	it('can POST a recipe image to a recipe and get a url where the image can be downloaded, which is referenced in the recipe object', function (done) {
		performRecipeImagePOST(recipeId, {responseType: 'full'})
		.then(function (response) {
			expect(response.statusCode).toBe(200);
			expect(response.body.imageId).toBeTruthy();
			expect(response.body.imageUrl).toBeTruthy();
			imageUrl = response.body.imageUrl;
			imageId = response.body.imageId;
			return performGETImage(response.body.imageUrl);
		})
		.then(function (response) {
			expect(response.statusCode).toBe(200);
			return dataUtils.getRecipe(recipeId);
		})
		.then(function (recipeResponse) {
			expect(recipeResponse.image.imageUrl).toBe(imageUrl);
			expect(recipeResponse.image.imageId).toBe(imageId);
		})
		.then(done, done.fail);
	});

	it('the recipe image can be DELETED, which results in the url being removed from the recipe', function (done) {
		performGETImage(imageUrl)
		.then(function (imageResponse) {
			expect(imageResponse.statusCode).toBe(200);
			return performDELETEImage(recipeId, imageId, {authUserId: userId, responseType: 'full'});
		})
		.then(function (response) {
			expect(response.statusCode).toBe(204);
			return dataUtils.getRecipe(recipeId);
		})
		.then(function (recipeResponse) {
			expect(recipeResponse.image).toBe(null);
			return performGETImage(imageUrl);
		})
		.then(function (imageResponse) {
			expect(imageResponse.statusCode).toBe(404);
		})
		.then(done, done.fail);
	});

	describe('authorization', function () {

		it('attempting to POST an image when you are not the owner of the recipe will cause a 401 and will not add the image to the recipe', function (done) {
			performRecipeImagePOST(recipeId, {authUserId: '577d1a8e3dcc7d0c76cb72d0', responseType: 'full'})
			.then(function (response) {
				expect(response.statusCode).toBe(401);
				return dataUtils.getRecipe(recipeId);
			})
			.then(function (recipe) {
				expect(recipe.image).toBe(null);
			})
			.then(done, done.fail);
		});

		it('attempting to POST an image with no user will return 401 and will not add the image to the recipe', function (done) {
			performRecipeImagePOST(recipeId, {authUserId: 'none', responseType: 'full'})
			.then(function (response) {
				expect(response.statusCode).toBe(401);
				return dataUtils.getRecipe(recipeId);
			})
			.then(function (recipe) {
				expect(recipe.image).toBe(null);
			})
			.then(done, done.fail);
		});


		describe('with an existing image', function () {
			var imageId;

			beforeAll(function(done) {
				performRecipeImagePOST(recipeId, {responseType: 'full'})
				.then(function (response) {
					expect(response.statusCode).toBe(200);
					imageId = response.body.imageId;
				})
				.then(done, done.fail);
			});

			afterAll(function(done) {
				performDELETEImage(recipeId, imageId, {responseType: 'full'})
				.then(function (response) {
					expect(response.statusCode).toBe(204);
				})
				.then(done, done.fail);
			});

			it('attempting to DELETE an image, if the user does not own the recipe, will return 401 and will not delete the image', function (done) {
				 performDELETEImage(recipeId, imageId, {authUserId: '577d1a8e3dcc7d0c76cb72d0', responseType: 'full'})
				.then(function (response) {
					expect(response.statusCode).toBe(401);
					return dataUtils.getRecipe(recipeId);
				})
				.then(function (recipe) {
					expect(recipe.image.imageId).toBe(imageId);
				})
				.then(done, done.fail);
			});

			it('attempting to DELETE an image, if no user is logged in, will return 401 and will not delete the image', function (done) {
				performDELETEImage(recipeId, imageId, {authUserId: 'none', responseType: 'full'})
				.then(function (response) {
					expect(response.statusCode).toBe(401);
					return dataUtils.getRecipe(recipeId);
				})
				.then(function (recipe) {
					expect(recipe.image.imageId).toBe(imageId);
				})
				.then(done, done.fail);
			});
		});
	});

	describe('edge cases', function () {

		it('attempting to POST an image to a recipe that does not exist will return 404', function (done) {
			performRecipeImagePOST("unknownId", {responseType: 'full'})
			.then(function (response) {
				expect(response.statusCode).toBe(404);
				return dataUtils.getRecipe(recipeId);
			})
			.then(done, done.fail);
		});

		it('attempting to DELETE an image that does not exist in a recipe, will return 404', function (done) {
			performDELETEImage(recipeId, "unknownId", {responseType: 'full'})
			.then(function (response) {
				expect(response.statusCode).toBe(404);
			})
			.then(done, done.fail);
		});

		it('attempting to DELETE an image for a recipe that does not exist will return 404', function (done) {
			performDELETEImage("unknownId", imageId, {responseType: 'full'})
			.then(function (response) {
				expect(response.statusCode).toBe(404);
			})
			.then(done, done.fail);
		});
	});
});