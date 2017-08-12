'use strict';

describe('the user module', function () {

	var httpBackend, userService, cookies;

	var userCookieKey = 'myrecipeconnection.com.usersLoggedInFromThisBrowser';
	var googleCookieKey = 'RecipeConnectionGoogleAuth';
	var now = new Date();
	var cookieExpires = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1);

	var googleUser = {userId: 'user-id', userName: 'user-name', userEmail: 'user-email'};

	beforeEach(angular.mock.module('my.templates', 'recipe'));

	beforeEach(angular.mock.inject(function (_userService_, $httpBackend, $cookies) {
		httpBackend = $httpBackend;
		userService = _userService_;
		cookies = $cookies;
	}));

	afterEach(function () {
		cookies.remove(userCookieKey);
	});

	describe('the isExternalLoginBeingAttempted function', function () {

		it('will return true if a google auth cookie exists', function () {
			cookies.putObject(googleCookieKey, {userName: 'google-name', userEmail: 'google-email'}, {expires: cookieExpires});
			var result = userService.isExternalLoginBeingAttempted();
			expect(result).toBe(true);
		});

		it('will return false if no google auth cookie exists', function () {
			cookies.remove(googleCookieKey);
			var result = userService.isExternalLoginBeingAttempted();
			expect(result).toBe(false);
		});
	});

	describe('the performExternalLogin function', function () {

		it('will call the backend to log in a user with the google-auth cookie email', function (done) {
			cookies.putObject(googleCookieKey, {userName: 'google-name', userEmail: 'google-email'}, {expires: cookieExpires});

			httpBackend.expect('GET', '/api/user?email=google-email').respond(googleUser);

			userService.performExternalLogin().then(function (result) {
				expect(userService.getLoggedInUser()).toEqual(googleUser);
				expect(result.data).toEqual(googleUser);
				done();
			});
			httpBackend.flush();
		});

		it('will call the backend to register a new user if a google-auth cookie exists, and no user exists for the given email', function (done) {
			cookies.putObject(googleCookieKey, {userName: 'google-name', userEmail: 'google-email'}, {expires: cookieExpires});
			var newUser = {userId: 555, userName: 'new-name', userEmail: 'new-email'};

			httpBackend.expect('GET', '/api/user?email=google-email').respond(404, {message: 'not found'});
			httpBackend.expect('POST', '/api/user', {userName: 'google-name', userEmail: 'google-email'}).respond(newUser);

			userService.performExternalLogin().then(function (result) {
				expect(userService.getLoggedInUser()).toEqual(newUser);
				expect(result.data).toEqual(newUser);
				done();
			});
			httpBackend.flush();
		});

		it('will return an empty object if no google auth cookie exists', function () {
			cookies.remove(googleCookieKey);

			userService.performExternalLogin();

			expect(userService.getLoggedInUser()).toEqual({});
		});
	});

});