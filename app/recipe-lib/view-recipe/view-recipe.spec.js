'use strict';

describe('the view recipe controller', function () {

	beforeEach(angular.mock.module('recipe', 'my.templates'));

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

	describe('when not in edit mode', function () {

		var scope, imageUploadScope, upload;

		var recipe = {recipeId: '1', recipeName: 'name', recipeContent: 'content', editable: true, image: {imageId: 'imageId', imageUrl: 'hiImAnImageUrl'}};
		var recipeWithNOImaage = {recipeId: '1', recipeName: 'name', recipeContent: 'content', editable: true, image: null};

		var editRecipeButtonSelector = '#edit-recipe-button';
		var imageUploadSectionSelector = '.image-upload-section';
		var imageUploadToggleSelector = '.image-upload-toggle';
		var imageSelector = '.recipe-image';

		beforeEach(function () {
			angular.mock.inject(function ($controller, $rootScope, _Upload_) {
				scope = $rootScope.$new();
				$controller('ViewRecipeCtrl', {
					$scope: scope
				});

				imageUploadScope = scope.$new();
				upload = _Upload_;

				$controller('imageUploadCtrl', {
					$scope: imageUploadScope,
					Upload: upload
				});
			});
		});

		function loadPage(recipe) {
			angular.mock.inject(function ($httpBackend, $templateCache, $compile) {
				$httpBackend.expect('GET', 'api/recipe/undefined').respond(recipe);
				$httpBackend.expect('GET', '/api/user/undefined/recipe-book').respond([]);
				$httpBackend.flush();

				setFixtures($templateCache.get('recipe-lib/view-recipe/view-recipe.html'));

				var fixture = angular.element(document).find('div')[0];
				var elem = angular.element(fixture);

				$compile(elem)(scope);
				scope.$digest();
			});
		}

		it('should not show the image upload section in edit mode', function () {

			loadPage(recipe);

			expect($(imageUploadSectionSelector)).not.toBeVisible();
			expect($(imageUploadToggleSelector)).not.toBeVisible();
		});

		it('should show an existing image', function() {
			loadPage(recipe);
			expect($(imageSelector)).toBeVisible();
			expect($(imageSelector).attr('src')).toBe('hiImAnImageUrl');
		});

		it('should not show an image if none exists', function() {
			loadPage(recipeWithNOImaage);
			expect($(imageSelector)).not.toBeVisible();
		});
	});

	describe('when in edit mode', function () {

		var scope, imageUploadScope, upload;

		var recipe = {recipeId: '1', recipeName: 'name', recipeContent: 'content', editable: true, image: null};

		var editRecipeButtonSelector = '#edit-recipe-button';
		var imageUploadSectionSelector = '.image-upload-section';
		var imageUploadModalSelector = '.image-upload-modal';
		var imageUploadToggleSelector = '.image-upload-toggle';
		var closeUploadSelector = '.close-upload-image-button';
		var closeUploadXSelector = '.close-upload-image-x';

		beforeEach(function () {
			angular.mock.inject(function ($controller, $rootScope, _Upload_) {
				scope = $rootScope.$new();
				$controller('ViewRecipeCtrl', {
					$scope: scope
				});

				imageUploadScope = scope.$new();
				upload = _Upload_;

				$controller('imageUploadCtrl', {
					$scope: imageUploadScope,
					Upload: upload
				});
			});
		});

		function loadPageInEditMode() {
			angular.mock.inject(function ($httpBackend, $templateCache, $compile) {
				$httpBackend.expect('GET', 'api/recipe/undefined').respond(recipe);
				$httpBackend.expect('GET', '/api/user/undefined/recipe-book').respond([]);
				$httpBackend.flush();

				setFixtures($templateCache.get('recipe-lib/view-recipe/view-recipe.html'));

				var fixture = angular.element(document).find('div')[0];
				var elem = angular.element(fixture);

				$compile(elem)(scope);
				scope.$digest();

				var editRecipeButton = $(editRecipeButtonSelector);
				SpecUtils.clickElement(editRecipeButton);
			});
		}

		it('does not start showing the image upload section', function () {
			loadPageInEditMode();

			expect($(imageUploadSectionSelector)).not.toBeVisible();
			expect($(imageUploadToggleSelector)).toBeVisible();
			expect($(imageUploadToggleSelector).text()).toBe(' Upload Image');
		});

		it('shows and hides the image upload section when pressing the open and close buttons', function (done) {
			loadPageInEditMode();
			var toggle = $(imageUploadToggleSelector);

			expect($(imageUploadSectionSelector)).not.toBeVisible();

			SpecUtils.clickElement(toggle);
			$(imageUploadModalSelector).on('shown.bs.modal', function () {
				expect($(imageUploadSectionSelector)).toBeVisible();

				var close = $(closeUploadSelector);
				SpecUtils.clickElement(close);
				$(imageUploadModalSelector).on('hidden.bs.modal', function () {
					expect($(imageUploadSectionSelector)).not.toBeVisible();
					done();
				});
			});
		});

		it('shows and hides the image upload section when pressing the open and close X buttons', function (done) {
			loadPageInEditMode();
			var toggle = $(imageUploadToggleSelector);

			expect($(imageUploadSectionSelector)).not.toBeVisible();

			SpecUtils.clickElement(toggle);
			$(imageUploadModalSelector).on('shown.bs.modal', function () {
				expect($(imageUploadSectionSelector)).toBeVisible();

				var closeX = $(closeUploadXSelector);
				SpecUtils.clickElement(closeX);
				$(imageUploadModalSelector).on('hidden.bs.modal', function () {
					expect($(imageUploadSectionSelector)).not.toBeVisible();
					done();
				});
			});
		});

		it('includes an uploaded image when saving the recipe', function () {
			angular.mock.inject(function ($httpBackend) {
				loadPageInEditMode();
				upload.upload = SpecUtils.buildMockPromiseFunction({data: {imageId: 'imageId', imageUrl: 'imageUrl'}});

				SpecUtils.clickElement($(imageUploadToggleSelector));
				SpecUtils.clickElement($('.upload-image-button'));

				var expectedRecipe = {recipeId: '1', recipeName: 'name', recipeContent: 'content', image: {imageId: 'imageId', imageUrl: 'imageUrl'}};
				$httpBackend.expect('PUT', '/api/recipe/1', expectedRecipe).respond(recipe);
				SpecUtils.clickElement($('#update-recipe-button'));
			});
		});

	});
});