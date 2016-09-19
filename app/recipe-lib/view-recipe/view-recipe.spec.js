'use strict';

function buildMockPromiseFunction(valueToResolveTo) {
	var valuePromise = undefined;
	inject(function ($q) {
		var valueDeferred = $q.defer();
		valuePromise = valueDeferred.promise;
		valueDeferred.resolve(valueToResolveTo);
	});

	return jasmine.createSpy('').and.returnValue(valuePromise);;
}

describe('the view recipe controller', function () {

	beforeEach(module('recipe'));

	describe('the scope canAddToRecipeBook function', function () {
		var scope;
		var compile;
		var recipeBookService;
		var recipeBook = [{recipeId: 12}, {recipeId: 13}];

		function buildControllerForRecipeId(options) {
			inject(function ($controller, $rootScope, $compile, $q) {
				var recipeIdToUse = options.withRecipeInRecipeBook ? 12 : 42;
				scope = $rootScope.$new();
				compile = $compile;

				recipeBookService = {};
				recipeBookService.getRecipeBook = buildMockPromiseFunction(recipeBook);

				$controller('ViewRecipeCtrl', {
					$scope: scope,
					$routeParams: {recipeId: recipeIdToUse},
					recipeBookService: recipeBookService
				});
			});
		}

		function initializeController(options) {
			angular.mock.inject(function (userService, $httpBackend) {
				var recipeIdToUse = options.withRecipeInRecipeBook ? 12 : 42;
				$httpBackend.expect('GET', 'api/recipe/' + recipeIdToUse).respond({recipeId: recipeIdToUse});

				$httpBackend.flush();
			});
		}

		it('will return false if no user is logged in', function () {
			angular.mock.inject(function (userService) {
				var options = {withRecipeInRecipeBook: false};
				spyOn(userService, 'isLoggedIn').and.returnValue(false);

				buildControllerForRecipeId(options)
				initializeController(options);

				var result = scope.canAddToRecipeBook();
				expect(result).toBe(false);
			});
		});

		it('will return false if the current recipe is in the logged in users recipe book', function () {
			angular.mock.inject(function (userService) {
				var options = {withRecipeInRecipeBook: true};
				spyOn(userService, 'isLoggedIn').and.returnValue(true);

				buildControllerForRecipeId(options)
				initializeController(options);

				var result = scope.canAddToRecipeBook();
				expect(result).toBe(false);
			});
		});

		it('will return false if in editMode', function () {
			angular.mock.inject(function (userService) {
				var options = {withRecipeInRecipeBook: false};
				spyOn(userService, 'isLoggedIn').and.returnValue(true);

				buildControllerForRecipeId(options)
				initializeController(options);

				scope.editClicked();

				var result = scope.canAddToRecipeBook();
				expect(result).toBe(false);
			});
		});

		it('will return true if the user is logged in and the page is not in edit mode and the recipe is in the users recipe book', function () {
			angular.mock.inject(function (userService) {
				var options = {withRecipeInRecipeBook: false};
				spyOn(userService, 'isLoggedIn').and.returnValue(true);

				buildControllerForRecipeId(options)
				initializeController(options);

				var result = scope.canAddToRecipeBook();
				expect(result).toBe(true);
			});
		});
	});

	describe('when given the html used in the application for the /view-recipe/:recipeId route', function () {

		var scope;
		var compile;

		beforeEach(inject(function ($controller, $rootScope, $compile) {
			scope = $rootScope.$new();
			compile = $compile;
			$controller('ViewRecipeCtrl', {
				$scope: scope
			});
		}));

		function loadPage($httpBackend) {
			$httpBackend.expect('GET', 'api/recipe/undefined').respond({});
			$httpBackend.expect('GET', '/api/user/undefined/recipe-book').respond({});
			$httpBackend.expect('GET', 'recipe-lib/user/user.html').respond('<div></div>');

			jasmine.getFixtures().fixturesPath = 'base/app/recipe-lib/view-recipe';
			loadFixtures('view-recipe.html');

			var doc = angular.element(document);
			var fixture = doc.find('div');

			var elem = angular.element(fixture);
			compile(elem)(scope);
			scope.$digest();
		}

		it('the add to recipe book button is visible when scope returns true for canAddToRecipeBook', function () {
			angular.mock.inject(function ($httpBackend) {
				spyOn(scope, 'canAddToRecipeBook').and.returnValue(true);
				loadPage($httpBackend);

				var addToRecipeBookButton = $('.add-to-recipe-book-button');
				expect(addToRecipeBookButton).toBeVisible();
			});
		});

		it('the add to recipe book button is not visible when scope returns true for canAddToRecipeBook', function () {
			angular.mock.inject(function ($httpBackend) {
				spyOn(scope, 'canAddToRecipeBook').and.returnValue(false);
				loadPage($httpBackend);

				var addToRecipeBookButton = $('.add-to-recipe-book-button');
				expect(addToRecipeBookButton).not.toBeVisible();
			});
		});
	});
});