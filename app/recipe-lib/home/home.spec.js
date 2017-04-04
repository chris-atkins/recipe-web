'use strict';

describe('the home page', function() {

	var scope, location, userService;

	beforeEach(angular.mock.module('my.templates', 'recipe'));

	beforeEach(angular.mock.inject(function ($rootScope, _$location_, $controller, _userService_) {
		scope = $rootScope.$new();
		location = _$location_;
		userService = _userService_;

		$controller('HomeCtrl', {
			$scope: scope,
			userService: userService,
			$location: location
		});
	}));

	describe('when a user is not logged in ', function() {

		beforeEach(function() {
			userService.getLoggedInUser = jasmine.createSpy('').and.returnValue({});
			userService.isLoggedIn = jasmine.createSpy('').and.returnValue(false);
			SpecUtils.loadPage('recipe-lib/home/home.html', scope);
			spyOn(location, 'url');
		});

		it('clicking the save recipe button will result in an error message that is dismissable', function() {
			var saveRecipeButton = $('#save-button');
			SpecUtils.clickElement(saveRecipeButton);

			expect($('.login-required-alert')).toBeVisible();
			expect($('#alert-message').text()).toBe('You must be logged in to perform this action.');

			SpecUtils.clickElement($('#close-alert'));
			expect($('.login-required-alert')).not.toBeVisible();
		});

		it('clicking the recipe book button will result in an error message that is dismissable', function() {
			expect($('.login-required-alert')).not.toBeVisible();
			var saveRecipeButton = $('#recipe-book-button');
			SpecUtils.clickElement(saveRecipeButton);

			expect($('.login-required-alert')).toBeVisible();
			expect($('#alert-message').text()).toBe('You must be logged in to perform this action.');

			SpecUtils.clickElement($('#close-alert'));
			expect($('.login-required-alert')).not.toBeVisible();
		});
	});
});