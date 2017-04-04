'use strict';

describe('the navbar module', function () {

	var scope, location, http, userService;
	var loggedInUser = {'userId': 'userId1', 'userName': 'Me', 'userEmail': 'i'};

	beforeEach(angular.mock.module('my.templates', 'recipe'));

	beforeEach(angular.mock.inject(function ($rootScope, $httpBackend, _$location_, $controller, _userService_) {
		scope = $rootScope.$new();
		location = _$location_;
		userService = _userService_;

		$controller('NavbarCtrl', {
			$scope: scope,
			$http: http,
			userService: userService,
			$location: location
		});

		// httpBackend.expect('GET', 'api/user/userId1').respond(loggedInUser);
		// httpBackend.flush();

	}));


	describe('when the user is logged in', function () {

		beforeEach(function() {
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

	describe('when the user is not logged in', function() {

		beforeEach(function() {
			userService.getLoggedInUser = jasmine.createSpy('').and.returnValue({});
			userService.isLoggedIn = jasmine.createSpy('').and.returnValue(false);
			SpecUtils.loadPage('recipe-lib/navbar/navbar.html', scope);
			spyOn(location, 'url');
		});

		it('the alert starts off invisible', function() {
			var needToLogInAlert = $('.need-to-log-in-alert');
			expect(needToLogInAlert).not.toBeVisible();
		});

		it('the Home Page link works the same as when the user is logged in', function(){
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
	});

	describe('when showing the error message', function() {

		beforeEach(function() {
			userService.getLoggedInUser = jasmine.createSpy('').and.returnValue({});
			userService.isLoggedIn = jasmine.createSpy('').and.returnValue(false);
			SpecUtils.loadPage('recipe-lib/navbar/navbar.html', scope);
			var saveRecipeLink = $('.nav-save-page-link');
			SpecUtils.clickElement(saveRecipeLink);
		});

		it('the error message can be dismissed by clicking the X inside the message', function() {
			var needToLogInAlert = $('.login-required-alert .message');
			expect(needToLogInAlert).toBeVisible();

			var dismissButton = $('.login-required-alert .close');
			SpecUtils.clickElement(dismissButton);
			expect(needToLogInAlert).not.toBeVisible();
		});

		it('the error message can be dismissed by clicking the Login link', function() {
			var needToLogInAlert = $('.login-required-alert .message');
			expect(needToLogInAlert).toBeVisible();

			var loginLink = $('.login-link');
			SpecUtils.clickElement(loginLink);
			expect(needToLogInAlert).not.toBeVisible();
		});
	});

});