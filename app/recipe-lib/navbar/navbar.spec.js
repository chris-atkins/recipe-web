'use strict';

describe('the navbar module', function () {

	var scope, location, userService, externalNavigationService;

	var loggedInUser = {'userId': 'userId1', 'userName': 'Me', 'userEmail': 'i'};

	beforeEach(angular.mock.module('my.templates', 'recipe'));

	beforeEach(angular.mock.inject(function ($rootScope, _$location_, $controller, _userService_, $http, _externalNavigationService_) {
		scope = $rootScope.$new();
		location = _$location_;
		userService = _userService_;
		externalNavigationService = _externalNavigationService_;

		$controller('NavbarCtrl', {
			$scope: scope,
			$http: $http,
			userService: userService,
			$location: location,
			externalNavigationService: externalNavigationService
		});
	}));


	describe('when the user is logged in', function () {

		beforeEach(function () {
			userService.getLoggedInUser = jasmine.createSpy('').and.returnValue(loggedInUser);
			userService.isLoggedIn = jasmine.createSpy('').and.returnValue(true);
			SpecUtils.loadPage('recipe-lib/navbar/navbar.html', scope);
			spyOn(location, 'url');
		});

		it('has a Home Page link that navigates to the home page when clicked', function () {
			var homePageLink = $('.nav-home-page-link');
			expect(homePageLink.text()).toBe('Home Page');

			SpecUtils.clickElement(homePageLink);
			expect(location.url).toHaveBeenCalledWith('/home');
		});

		it('has a Browse Recipes link that navigates to the browse recipes page when clicked', function () {
			var browseRecipesLink = $('.nav-browse-page-link');
			expect(browseRecipesLink.text()).toBe('Browse Recipes');

			SpecUtils.clickElement(browseRecipesLink);
			expect(location.url).toHaveBeenCalledWith('/search-recipes');
		});

		it('has a Save New Recipe link that navigates to the save new recipe page when clicked', function () {
			var saveRecipeLink = $('.nav-save-page-link');
			expect(saveRecipeLink.text()).toBe('Save Recipe');

			SpecUtils.clickElement(saveRecipeLink);
			expect(location.url).toHaveBeenCalledWith('/new-recipe');
		});

		it('has a Recipe Book link that navigates to the Recipe Book page when clicked', function () {
			var recipeBookLink = $('.nav-recipe-book-page-link');
			expect(recipeBookLink.text()).toBe('Recipe Book');

			SpecUtils.clickElement(recipeBookLink);
			expect(location.url).toHaveBeenCalledWith('/user/userId1/recipe-book');
		});
	});

	describe('when the user is not logged in', function () {

		beforeEach(function () {
			userService.getLoggedInUser = jasmine.createSpy('').and.returnValue({});
			userService.isLoggedIn = jasmine.createSpy('').and.returnValue(false);
			SpecUtils.loadPage('recipe-lib/navbar/navbar.html', scope);
			spyOn(location, 'url');
		});

		it('the alert starts off invisible', function () {
			var needToLogInAlert = $('.need-to-log-in-alert');
			expect(needToLogInAlert).not.toBeVisible();
		});

		it('the Home Page link works the same as when the user is logged in', function () {
			var homePageLink = $('.nav-home-page-link');
			SpecUtils.clickElement(homePageLink);
			expect(location.url).toHaveBeenCalledWith('/home');
		});

		it('the Browse Recipes link works the same as when the user is logged in', function () {
			var browseRecipesLink = $('.nav-browse-page-link');
			SpecUtils.clickElement(browseRecipesLink);
			expect(location.url).toHaveBeenCalledWith('/search-recipes');
		});

		it('the Save New Recipe link shows an error message and does not navigate', function () {
			var saveRecipeLink = $('.nav-save-page-link');
			SpecUtils.clickElement(saveRecipeLink);
			expect(location.url).not.toHaveBeenCalled();

			var needToLogInAlert = $('.login-required-alert .message');
			expect(needToLogInAlert.text()).toBe("You must be logged in to perform this action.");
			expect(needToLogInAlert).toBeVisible();
		});

		it('the Recipe Book link shows an error message and does not navigate', function () {
			var recipeBookLink = $('.nav-recipe-book-page-link');
			SpecUtils.clickElement(recipeBookLink);
			expect(location.url).not.toHaveBeenCalled();

			var needToLogInAlert = $('.login-required-alert .message');
			expect(needToLogInAlert).toBeVisible();
		});

		describe('there is login functionality available', function () {

			it('there exists a dropdown that has google auth or manual email entering options', function () {
				var loginDropdown = $('.login-dropdown');
				SpecUtils.clickElement(loginDropdown);

				var googleAuthButton = $('.user-dropdown-menu .google-auth');
				var emailEntryField = $('.user-dropdown-menu input#sign-up-user-email');
				var loginButton = $('.user-dropdown-menu button#log-in-user-button');

				expect(googleAuthButton).toBeVisible();

				expect(emailEntryField).toBeVisible();

				expect(loginButton).toBeVisible();
				expect(loginButton.text()).toBe('Log In');
			});

			describe('with google login that', function () {

				it('navigates to a google auth endpoint with a query param containing the current url', function () {
					var loginDropdown = $('.login-dropdown');
					var googleAuthButton = $('.user-dropdown-menu .google-auth img');

					spyOn(location, 'path').and.returnValue('hi');
					spyOn(externalNavigationService, 'navigateTo');

					SpecUtils.clickElement(loginDropdown);
					SpecUtils.clickElement(googleAuthButton);

					expect(externalNavigationService.navigateTo).toHaveBeenCalledWith('/auth/google?callbackPath=hi');
				});
			});
		});
	});

	describe('when showing the error message', function () {

		beforeEach(function () {
			userService.getLoggedInUser = jasmine.createSpy('').and.returnValue({});
			userService.isLoggedIn = jasmine.createSpy('').and.returnValue(false);
			SpecUtils.loadPage('recipe-lib/navbar/navbar.html', scope);
			var saveRecipeLink = $('.nav-save-page-link');
			SpecUtils.clickElement(saveRecipeLink);
		});

		it('the error message can be dismissed by clicking the X inside the message', function () {
			var needToLogInAlert = $('.login-required-alert .message');
			expect(needToLogInAlert).toBeVisible();

			var dismissButton = $('.login-required-alert .close');
			SpecUtils.clickElement(dismissButton);
			expect(needToLogInAlert).not.toBeVisible();
		});

		it('the error message can be dismissed by clicking the Login link', function () {
			var needToLogInAlert = $('.login-required-alert .message');
			expect(needToLogInAlert).toBeVisible();

			var loginDropdown = $('.login-dropdown');
			SpecUtils.clickElement(loginDropdown);
			expect(needToLogInAlert).not.toBeVisible();
		});
	});

	describe('on load', function () {

		var createController;

		beforeEach(angular.mock.inject(function ($rootScope, _$location_, $controller, _userService_, _externalNavigationService_, $http) {
			scope = $rootScope.$new();
			location = _$location_;
			userService = _userService_;
			externalNavigationService = _externalNavigationService_;

			createController = function() {
				return $controller('NavbarCtrl', {
					$scope: scope,
					$http: $http,
					userService: userService,
					$location: location,
					externalNavigationService: externalNavigationService
				});
			};
		}));

		it('asks the user service if login is being attempted and directs it to log in if it is', function () {

			userService.isExternalLoginBeingAttempted = jasmine.createSpy('').and.returnValue(true);
			userService.performExternalLogin = SpecUtils.buildMockPromiseFunction({});
			userService.getLoggedInUser = jasmine.createSpy('').and.returnValue({userId: 'hi', userName: 'theBestUser', userEmail: 'a@b.com'});
			userService.isLoggedIn = jasmine.createSpy('').and.returnValue(true);

			createController();

			expect(userService.isExternalLoginBeingAttempted).toHaveBeenCalled();
			expect(scope.user).toEqual({userId: 'hi', userName: 'theBestUser', userEmail: 'a@b.com'});
			expect(scope.isLoggedIn).toBe(true);
			expect(scope.loginMessage).toBe('Welcome, theBestUser');

		});

		it('asks the user service if login is being attempted and does not attempt login if not', function () {

			userService.isExternalLoginBeingAttempted = jasmine.createSpy('').and.returnValue(false);
			userService.performExternalLogin = SpecUtils.buildMockPromiseFunction({});

			createController();

			expect(scope.user).toEqual({});
			expect(scope.isLoggedIn).toBe(false);
			expect(userService.performExternalLogin).not.toHaveBeenCalled();
		});
	});

});