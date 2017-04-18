'use strict';

describe('the view recipe controller', function () {

	beforeEach(module('recipe', 'my.templates'));

	describe('the scope canAddToRecipeBook function', function () {
		var scope;
		var recipeBookService;
		var recipeBook = [{recipeId: 12}, {recipeId: 13}];

		function buildControllerForRecipeId(options) {
			inject(function ($controller, $rootScope) {
				var recipeIdToUse = options.withRecipeInRecipeBook ? 12 : 42;
				scope = $rootScope.$new();

				recipeBookService = {};
				recipeBookService.getRecipeBook = SpecUtils.buildMockPromiseFunction(recipeBook);

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

	describe('the scope canRemoveFromRecipeBook function', function () {

		describe('when the current recipe is in the recipe book', function () {
			var scope;

			beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
				scope = $rootScope.$new();
				var recipeBookService = {};
				recipeBookService.getRecipeBook = SpecUtils.buildMockPromiseFunction([{recipeId: 5}])

				$httpBackend.expect('GET', 'api/recipe/recipeIdNotInRecipeBook').respond({recipeId: 5});

				$controller('ViewRecipeCtrl', {
					$scope: scope,
					$routeParams: {recipeId: 'recipeIdNotInRecipeBook'},
					recipeBookService: recipeBookService
				});
				$httpBackend.flush();
			}));

			it('when in edit mode, returns false', function () {
				scope.editClicked();
				var result = scope.canRemoveFromRecipeBook();
				expect(result).toBe(false);
			});

			it('when not in edit mode, returns true', function () {
				var result = scope.canRemoveFromRecipeBook();
				expect(result).toBe(true);
			});
		});

		describe('when the current recipe is not in the recipe book', function () {
			var scope;

			beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
				scope = $rootScope.$new();
				var recipeBookService = {};
				recipeBookService.getRecipeBook = SpecUtils.buildMockPromiseFunction([{recipeId: 5}])

				$httpBackend.expect('GET', 'api/recipe/recipeIdNotInRecipeBook').respond({recipeId: 'recipeNotInRecipeBook'});

				$controller('ViewRecipeCtrl', {
					$scope: scope,
					$routeParams: {recipeId: 'recipeIdNotInRecipeBook'},
					recipeBookService: recipeBookService
				});
				$httpBackend.flush();
			}));

			it('when in edit mode, returns false', function () {
				scope.editClicked();
				var result = scope.canRemoveFromRecipeBook();
				expect(result).toBe(false);
			});

			it('when not in edit mode, returns false', function () {
				var result = scope.canRemoveFromRecipeBook();
				expect(result).toBe(false);
			});
		});
	});

	describe('the recipe book buttons', function () {

		var scope;
		var compile;

		beforeEach(inject(function ($controller, $rootScope, $compile) {
			scope = $rootScope.$new();
			compile = $compile;
			$controller('ViewRecipeCtrl', {
				$scope: scope
			});
		}));

		function loadPage() {
			angular.mock.inject(function ($httpBackend, $templateCache) {
				$httpBackend.expect('GET', 'api/recipe/undefined').respond({});
				$httpBackend.expect('GET', '/api/user/undefined/recipe-book').respond({});
				$httpBackend.expect('GET', 'recipe-lib/navbar/navbar.html').respond('<div></div>');

				setFixtures($templateCache.get('recipe-lib/view-recipe/view-recipe.html'));

				var doc = angular.element(document);
				var fixture = doc.find('div');

				var elem = angular.element(fixture);
				compile(elem)(scope);
				scope.$digest();
			});
		}

		it('the add to recipe book button is visible when scope returns true for canAddToRecipeBook', function () {
			spyOn(scope, 'canAddToRecipeBook').and.returnValue(true);
			loadPage();

			var addToRecipeBookButton = $('.add-to-recipe-book-button');
			expect(addToRecipeBookButton).toBeVisible();
		});

		it('the add to recipe book button is not visible when scope returns true for canAddToRecipeBook', function () {
			spyOn(scope, 'canAddToRecipeBook').and.returnValue(false);
			loadPage();

			var addToRecipeBookButton = $('.add-to-recipe-book-button');
			expect(addToRecipeBookButton).not.toBeVisible();
		});

		it('the remove from recipe book button is visible when scope returns true for canAddToRecipeBook', function () {
			spyOn(scope, 'canRemoveFromRecipeBook').and.returnValue(true);
			loadPage();

			var removeFromRecipeBookButton = $('.remove-recipe-from-book-button');
			expect(removeFromRecipeBookButton).toBeVisible();
		});

		it('the remove from recipe book button is not visible when scope returns true for canAddToRecipeBook', function () {
			spyOn(scope, 'canRemoveFromRecipeBook').and.returnValue(false);
			loadPage();

			var removeFromRecipeBookButton = $('.remove-recipe-from-book-button');
			expect(removeFromRecipeBookButton).not.toBeVisible();
		});
	});

	describe('when in edit mode', function () {

		var scope;
		var compile;

		beforeEach(inject(function ($controller, $rootScope, $compile) {
			scope = $rootScope.$new();
			compile = $compile;
			$controller('ViewRecipeCtrl', {
				$scope: scope
			});
		}));

		function loadPage() {
			angular.mock.inject(function ($httpBackend, $templateCache) {
				$httpBackend.expect('GET', 'api/recipe/undefined').respond({});
				$httpBackend.expect('GET', '/api/user/undefined/recipe-book').respond({});
				$httpBackend.expect('GET', 'recipe-lib/navbar/navbar.html').respond('<div></div>');

				setFixtures($templateCache.get('recipe-lib/view-recipe/view-recipe.html'));

				var doc = angular.element(document);
				var fixture = doc.find('div');

				var elem = angular.element(fixture);
				compile(elem)(scope);
				scope.$digest();
			});
		}

		it('the add to recipe book button is visible when scope returns true for canAddToRecipeBook', function () {
			spyOn(scope, 'canAddToRecipeBook').and.returnValue(true);
			loadPage();

			var addToRecipeBookButton = $('.add-to-recipe-book-button');
			expect(addToRecipeBookButton).toBeVisible();
		});

		it('the add to recipe book button is not visible when scope returns true for canAddToRecipeBook', function () {
			spyOn(scope, 'canAddToRecipeBook').and.returnValue(false);
			loadPage();

			var addToRecipeBookButton = $('.add-to-recipe-book-button');
			expect(addToRecipeBookButton).not.toBeVisible();
		});

		it('the remove from recipe book button is visible when scope returns true for canAddToRecipeBook', function () {
			spyOn(scope, 'canRemoveFromRecipeBook').and.returnValue(true);
			loadPage();

			var removeFromRecipeBookButton = $('.remove-recipe-from-book-button');
			expect(removeFromRecipeBookButton).toBeVisible();
		});

		it('the remove from recipe book button is not visible when scope returns true for canAddToRecipeBook', function () {
			spyOn(scope, 'canRemoveFromRecipeBook').and.returnValue(false);
			loadPage();

			var removeFromRecipeBookButton = $('.remove-recipe-from-book-button');
			expect(removeFromRecipeBookButton).not.toBeVisible();
		});
	});
});