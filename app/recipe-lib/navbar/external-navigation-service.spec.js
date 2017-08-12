'use strict';

describe('the externalNavigationService', function () {

	beforeEach(angular.mock.module('recipe'));

	beforeEach(function () {
		module(function($provide) {
			$provide.value('$window', {
				location: {href: ''}
			});
		});
	});

	describe('the navigateTo function', function () {

		it('performs window navigation', function () {
			angular.mock.inject(function (externalNavigationService, $window) {
				externalNavigationService.navigateTo('hi');
				expect($window.location.href).toEqual('hi');
			});
		});
	});
});