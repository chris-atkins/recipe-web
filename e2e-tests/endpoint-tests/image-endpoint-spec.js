'use strict';
var dataUtils = require('./../utils/data-utils');
var config = browser.params;
var rs = require('request-promise');
var fs = require('fs');

describe('the Image endpoints', function () {

	var userId;

	beforeAll(function (done) {
		var email = dataUtils.randomEmail();
		var user = {userName: 'ohai', userEmail: email};

		dataUtils.postUser(user)
		.then(function (user) {
			userId = user.userId;
		})
		.then(done, done.fail);
	});

	afterAll(function (done) {
		dataUtils.cleanupData(done);
	});

	function performImagePOST(options) {
		var postOptions = {
			uri: config.apiBaseUrl + '/image',
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

		if (options && options.authUserId === 'none') {
			delete postOptions.headers.RequestingUser;
		} else if (options && options.authUserId) {
			postOptions.headers.RequestingUser = options.authUserId;
		}

		return rs.post(postOptions).then(function (response) {
			return response;
		});
	}

	function performDELETEImage(imageId, options) {
		var deleteOptions = {
			uri: config.apiBaseUrl + '/image/' + imageId,
			headers: {
				'RequestingUser': userId
			},
			json: true,
			simple: false
		};

		if (options && options.responseType && options.responseType === 'full') {
			deleteOptions.resolveWithFullResponse = true;
		}

		if (options && options.authUserId === 'none') {
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

	it('can POST an image and get a url where the image can be downloaded', function (done) {
		performImagePOST({responseType: 'full'})
		.then(function (response) {
			expect(response.statusCode).toBe(200);
			expect(response.body.imageId).toBeTruthy();
			expect(response.body.imageUrl).toBeTruthy();
			imageUrl = response.body.imageUrl;
			imageId = response.body.imageId;
			return performGETImage(imageUrl);
		})
		.then(function (response) {
			expect(response.statusCode).toBe(200);
		})
		.then(done, done.fail);
	});

	it('the image can be DELETED', function (done) {
		performGETImage(imageUrl)
		.then(function (imageResponse) {
			expect(imageResponse.statusCode).toBe(200);
			return performDELETEImage(imageId, {authUserId: userId, responseType: 'full'});
		})
		.then(function (response) {
			expect(response.statusCode).toBe(204);
			return performGETImage(imageUrl);
		})
		.then(function (imageResponse) {
			expect(imageResponse.statusCode).toBe(404);
		})
		.then(done, done.fail);
	});

	describe('authorization', function () {

		it('attempting to POST an image with no user will return 401 and will not save the image', function (done) {
			performImagePOST({authUserId: 'none', responseType: 'full'})
			.then(function (response) {
				expect(response.statusCode).toBe(401);
			})
			.then(done, done.fail);
		});


		describe('with an existing image', function () {
			var imageId;
			var imageUrl;

			beforeAll(function(done) {
				performImagePOST({responseType: 'full'})
				.then(function (response) {
					expect(response.statusCode).toBe(200);
					imageId = response.body.imageId;
					imageUrl = response.body.imageUrl;
				})
				.then(done, done.fail);
			});

			afterAll(function(done) {
				performDELETEImage(imageId, {responseType: 'full'})
				.then(function (response) {
					expect(response.statusCode).toBe(204);
				})
				.then(done, done.fail);
			});

			it('attempting to DELETE an image, if the user does not own it, will return 403 and will not delete the image', function (done) {
				 performDELETEImage(imageId, {authUserId: '577d1a8e3dcc7d0c76cb72d0', responseType: 'full'})
				.then(function (response) {
					expect(response.statusCode).toBe(403);
					return performGETImage(imageUrl);
				})
				 .then(function (response) {
					 expect(response.statusCode).toBe(200);
				})
				.then(done, done.fail);
			});

			it('attempting to DELETE an image, if no user is logged in, will return 401 and will not delete the image', function (done) {
				performDELETEImage(imageId, {authUserId: 'none', responseType: 'full'})
				.then(function (response) {
					expect(response.statusCode).toBe(401);
					return performGETImage(imageUrl);
				})
				.then(function (response) {
					expect(response.statusCode).toBe(200);
				})
				.then(done, done.fail);
			});
		});
	});
});