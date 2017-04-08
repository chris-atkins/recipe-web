'use strict';
var dataUtils = require('./../utils/data-utils');
var config = browser.params;
var rs = require('request-promise');
var fs = require('fs');

describe('the Recipe Image endpoints', function () {

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

	function performRecipeImagePOST(options) {
		// var postOptions = {
		// 	uri : config.apiBaseUrl + '/recipe/' + recipeId + '/image',
		// 	headers : {
		// 		'Content-Type' : 'multipart/form-data; boundary=----WebKitFormBoundary6kNHU5Tc5TWXmnHV',
		// 		'Content-Length' : 1234,
		// 		'RequestingUser' : userId,
		// 		'Accept': 'application/json'
		// 	},
		// 	body: '------WebKitFormBoundary6kNHU5Tc5TWXmnHV\n' +
		// 	'Content-Disposition: form-data; name="file"; filename="/Users/chrisatkins/git/recipe-web/e2e-tests/endpoint-tests/pexels-photo-48726.jpeg"\n' +
		// 	'Content-Type: image/png\n\n' +
		// 	'------WebKitFormBoundary6kNHU5Tc5TWXmnHV--',
		//
		// 	simple: false //https://github.com/request/request-promise
		// };
		var stats = fs.statSync('/Users/chrisatkins/git/recipe-web/e2e-tests/endpoint-tests/pexels-photo-48726.jpeg');
		var fileSizeInBytes = stats.size;

		var postOptions = {
			uri: config.apiBaseUrl + '/recipe/' + recipeId + '/image',
			headers: {
				'RequestingUser': userId
			},
			formData: {
				'file': fs.createReadStream('/Users/chrisatkins/git/recipe-web/e2e-tests/endpoint-tests/pexels-photo-48726.jpeg')
			}
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

	function performGETImage(url) {
		var getOptions = {
			uri: url,
			resolveWithFullResponse: true,
			simple: false
		};
		return rs.get(getOptions);
	}

	function performRecipeImageDELETE(userId, recipeId, options) {
		// var deleteOptions = {
		// 	uri : config.apiBaseUrl + '/user/' + userId + '/recipe-book/' + recipeId,
		// 	headers : {
		// 		'RequestingUser' : userId
		// 	},
		// 	json : true,
		// 	simple: false //https://github.com/request/request-promise
		// };
		//
		// if (options && options.responseType && options.responseType === 'full') {
		// 	deleteOptions.resolveWithFullResponse = true;
		// }
		//
		// if (options && options.userId && options.authUserId === 'none') {
		// 	delete deleteOptions.headers.RequestingUser;
		// } else if (options && options.authUserId) {
		// 	deleteOptions.headers.RequestingUser = options.authUserId;
		// }
		//
		// return rs.del(deleteOptions);
	}

	it('can POST a recipe image to a recipe and get a url where the image can be downloaded', function (done) {

		performRecipeImagePOST({responseType: 'full'})
		.then(function (response) {
			var body = JSON.parse(response.body);

			expect(response.statusCode).toBe(200);
			expect(body.imageId).toBeTruthy();
			expect(body.imageUrl).toBeTruthy();
			return performGETImage(body.imageUrl);
		})
		.then(function (response) {
			expect(response.statusCode).toBe(200);
		})
		.then(done, done.fail);

		// var recipeIdToPost = {recipeId: listOfRecipeIds[0]};
		// performRecipeBookPOSTRecipe(recipeIdToPost, {responseType: 'full'})
		// .then(function(response) {
		// 	expect(response.statusCode).toBe(200);
		// 	expect(response.body).toEqual(recipeIdToPost);
		// })
		// .then(done, done.fail);
	});

	it('once posted, an image will have a link that is part of the recipe', function (done) {
		// performRecipeBookPOSTRecipe({recipeId: listOfRecipeIds[0]})
		// .then(function() {
		// 	return performRecipeBookPOSTRecipe({recipeId: listOfRecipeIds[1]});
		// })
		// .then(function() {
		// 	return performRecipeBookGET({responseType: 'full'});
		// })
		// .then(function(response) {
		// 	expect(response.statusCode).toBe(200);
		// 	var body = response.body;
		// 	expect(body.length).toBe(2);
		// 	expect(body).toContain({recipeId: listOfRecipeIds[0]});
		// 	expect(body).toContain({recipeId: listOfRecipeIds[1]});
		// })
		// .then(done, done.fail);
		done();
	});

	it('the recipe image can be DELETED', function (done) {
		// var sizeWithAllIds;
		// var recipeIdToDelete = listOfRecipeIds[2];
		//
		// performRecipeBookPOSTRecipe({recipeId: recipeIdToDelete})
		// .then(function() {
		// 	return performRecipeListGETByUserRecipeBook(userId);
		// })
		// .then(function(response) {
		// 	sizeWithAllIds = response.length;
		// })
		// .then(function() {
		// 	return performRecipeBookDELETERecipe(userId, recipeIdToDelete, {responseType: 'full'});
		// })
		// .then(function(response) {
		// 	expect(response.statusCode).toBe(204);
		// 	return performRecipeListGETByUserRecipeBook(userId);
		// })
		// .then(function(response) {
		// 	expect(response.length).toBe(sizeWithAllIds - 1);
		//
		// 	for (var i = 0; i < response.length; i++) {
		// 		expect(response[i].recipeId).not.toBe(recipeIdToDelete);
		// 	}
		// })
		// .then(done, done.fail);
		done();
	});

	describe('authorization', function () {

		it('attempting to POST an image when you are not the owner of the recipe will cause a 401 and will not add the image to the recipe', function (done) {

			// performRecipeBookPOSTRecipe({recipeId: listOfRecipeIds[2]}, {authUserId: '577d1a8e3dcc7d0c76cb72d0', responseType: 'full'})
			// .then(function(response) {
			// 	expect(response.statusCode).toBe(401);
			// })
			// .then(function() {
			// 	return performRecipeBookGET();
			// })
			// .then(function(recipeBook) {
			// 	expect(recipeBook).not.toContain({recipeId: listOfRecipeIds[2]});
			// })
			// .then(done, done.fail);
			done();
		});

		it('attempting to POST an image with no user will return 401 and will not add the image to the recipe', function (done) {

			// performRecipeBookPOSTRecipe({recipeId: listOfRecipeIds[2]}, {authUserId: 'none', responseType: 'full'})
			// .then(function(response) {
			// 	expect(response.statusCode).toBe(401);
			// })
			// .then(function() {
			// 	return performRecipeBookGET();
			// })
			// .then(function(recipeBook) {
			// 	expect(recipeBook).not.toContain({recipeId: listOfRecipeIds[2]});
			// })
			// .then(done, done.fail);
			done();
		});

		it('attempting to DELETE an image, if the user does not own the recipe, will return 401 and will not delete the image', function (done) {
			// performRecipeBookPOSTRecipe({recipeId: listOfRecipeIds[0]})
			// .then(function() {
			// 	return performRecipeBookDELETERecipe(userId, listOfRecipeIds[0], {authUserId: '577d1a8e3dcc7d0c76cb72d0', responseType: 'full'});
			// })
			// .then(function(response) {
			// 	expect(response.statusCode).toBe(401);
			// })
			// .then(function() {
			// 	return performRecipeBookGET();
			// })
			// .then(function(recipeBook) {
			// 	expect(recipeBook).toContain({recipeId: listOfRecipeIds[0]});
			// })
			// .then(done, done.fail);
			done();
		});

		it('attempting to DELETE an image, if no user is logged in, will return 401 and will not delete the image', function (done) {
			// performRecipeBookPOSTRecipe({recipeId: listOfRecipeIds[0]})
			// .then(function() {
			// 	return performRecipeBookDELETERecipe(userId, listOfRecipeIds[0], {authUserId: 'none', responseType: 'full'});
			// })
			// .then(function(response) {
			// 	expect(response.statusCode).toBe(401);
			// })
			// .then(function() {
			// 	return performRecipeBookGET();
			// })
			// .then(function(recipeBook) {
			// 	expect(recipeBook).toContain({recipeId: listOfRecipeIds[0]});
			// })
			// .then(done, done.fail);
			done();
		});
	});

	describe('edge cases', function () {

		it('attempting to DELETE an image that does not exist in a recipe, will return 404', function (done) {
			// var unknownRecipeId = '577d1a8e3dcc7d0c76cb72d1';
			// performRecipeBookDELETERecipe(userId, unknownRecipeId, {responseType: 'full'})
			// .then(function(response) {
			// 	expect(response.statusCode).toBe(404);
			// })
			// .then(done, done.fail);
			done();
		});

		it('attempting to DELETE an image for a recipe that does not exist will return 404', function (done) {
			done();
		});
	});
});