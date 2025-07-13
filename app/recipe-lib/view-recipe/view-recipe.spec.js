'use strict';

describe('the view recipe controller', function () {

	var copyAlternateUrlSelector = '.alternate-url-copy-button';

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

				buildControllerForRecipeId(options);
				initializeController(options);

				var result = scope.canAddToRecipeBook();
				expect(result).toBe(false);
			});
		});

		it('will return false if the current recipe is in the logged in users recipe book', function () {
			angular.mock.inject(function (userService) {
				var options = {withRecipeInRecipeBook: true};
				spyOn(userService, 'isLoggedIn').and.returnValue(true);

				buildControllerForRecipeId(options);
				initializeController(options);

				var result = scope.canAddToRecipeBook();
				expect(result).toBe(false);
			});
		});

		it('will return false if in editMode', function () {
			angular.mock.inject(function (userService) {
				var options = {withRecipeInRecipeBook: false};
				spyOn(userService, 'isLoggedIn').and.returnValue(true);

				buildControllerForRecipeId(options);
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

				buildControllerForRecipeId(options);
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
				recipeBookService.getRecipeBook = SpecUtils.buildMockPromiseFunction([{recipeId: 5}]);

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
				recipeBookService.getRecipeBook = SpecUtils.buildMockPromiseFunction([{recipeId: 5}]);

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

		var scope, imageUploadScope, upload, clipboard, location;

		var recipe = {recipeId: '1', recipeName: 'name', recipeContent: 'content', editable: true, image: {imageId: 'imageId', imageUrl: 'hiImAnImageUrl'}};
		var recipeWithNOImaage = {recipeId: '2', recipeName: 'name', recipeContent: 'content', editable: true, image: null};

		var imageUploadSectionSelector = '.image-upload-section';
		var imageUploadToggleSelector = '.image-upload-toggle';
		var imageSelector = '.recipe-image';

		beforeEach(function () {
			angular.mock.inject(function ($controller, $rootScope, _Upload_, _clipboard_, $location) {

				clipboard = _clipboard_;
				location = $location;
				spyOn(clipboard, 'copyText');

				spyOn(location, 'protocol').and.returnValue('wheee');
				spyOn(location, 'host').and.returnValue('thebesthost');

				scope = $rootScope.$new();
				$controller('ViewRecipeCtrl', {
					$scope: scope,
					clipboard: clipboard
				});


				imageUploadScope = scope.$new();
				upload = _Upload_;

				$controller('imageUploadCtrl', {
					$scope: imageUploadScope,
					Upload: upload
				});
			});
			SpecUtils.delayABit();
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
				SpecUtils.delayABit();
			});
			SpecUtils.delayABit();
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

		it('will have a button that copies an alternate url to the clipboard', function() {
			loadPage(recipe);
			SpecUtils.clickElement($(copyAlternateUrlSelector));
			scope.$digest();
			SpecUtils.delayABit();
			expect(clipboard.copyText).toHaveBeenCalledWith('wheee://thebesthost/recipe/1');
		});
	});

	describe('when in edit mode', function () {

		var scope, imageUploadScope, upload;

		var recipe = {recipeId: '1', recipeName: 'name', recipeContent: 'content', editable: true, image: null};
		var recipeWithImage = {recipeId: '1', recipeName: 'name', recipeContent: 'content', editable: true, image: {imageId: 'imageId', imageUrl: 'originalUrl'}};

		var editRecipeButtonSelector = '#edit-recipe-button';
		var imageUploadToggleSelector = '.image-upload-toggle';

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
			SpecUtils.delayABit();
		});

		function loadPageInEditMode(recipeToUse) {
			angular.mock.inject(function ($httpBackend, $templateCache, $compile) {
				var mockedRecipe = 	recipeToUse ? recipeToUse : recipe;
				$httpBackend.expect('GET', 'api/recipe/undefined').respond(mockedRecipe);
				$httpBackend.expect('GET', '/api/user/undefined/recipe-book').respond([]);
				$httpBackend.flush();

				setFixtures($templateCache.get('recipe-lib/view-recipe/view-recipe.html'));

				var fixture = angular.element(document).find('div')[0];
				var elem = angular.element(fixture);

				$compile(elem)(scope);
				scope.$digest();
				SpecUtils.delayABit();

				var editRecipeButton = $(editRecipeButtonSelector);
				SpecUtils.clickElement(editRecipeButton);
				SpecUtils.delayABit();
				scope.$digest();
				SpecUtils.delayABit();
			});
			scope.$digest();
			SpecUtils.delayABit();
		}

		it('does not have a copy alternate url button', function() {
			loadPageInEditMode(recipe);
			SpecUtils.delayABit();
			expect($(copyAlternateUrlSelector)).not.toBeVisible();
		});

		it('shows the upload image button', function () {
			loadPageInEditMode();
			SpecUtils.delayABit();
			expect($(imageUploadToggleSelector)).toBeVisible();
			expect($(imageUploadToggleSelector).text()).toBe(' Upload Image');
		});

		it('once an image has been saved, displays it on screen', function() {
			loadPageInEditMode(recipe);
			SpecUtils.delayABit();
			expect($('.edit-recipe-page .recipe-image')).not.toBeVisible();

			scope.imageSaved({imageUrl:'hi'});
			SpecUtils.delayABit();
			scope.$digest();
			SpecUtils.delayABit();

			expect($('.edit-recipe-page .recipe-image')).toBeVisible();
			expect($('.edit-recipe-page .recipe-image').attr('src')).toBe('hi');
		});

		it('starts off showing an existing image, but once a new image has been saved, displays it on screen', function() {
			loadPageInEditMode(recipeWithImage);
			SpecUtils.delayABit();
			expect($('.edit-recipe-page .recipe-image')).toBeVisible();
			expect($('.edit-recipe-page .recipe-image').attr('src')).toBe('originalUrl');

			scope.imageSaved({imageUrl:'newUrl'});
			SpecUtils.delayABit();
			scope.$digest();
			SpecUtils.delayABit();

			expect($('.edit-recipe-page .recipe-image')).toBeVisible();
			expect($('.edit-recipe-page .recipe-image').attr('src')).toBe('newUrl');
		});

		it('if an image has been uploaded, includes the uploaded image when saving the recipe', function () {
			angular.mock.inject(function ($httpBackend) {
				loadPageInEditMode();
				upload.upload = SpecUtils.buildMockPromiseFunction({data: {body: '{"imageId":"imageId","imageUrl":"imageUrl"}'}, status: 200});

				SpecUtils.clickElement($(imageUploadToggleSelector));
				SpecUtils.clickElement($('.upload-image-button'));
				SpecUtils.delayABit();
				scope.$digest();
				SpecUtils.delayABit();

				var expectedRecipe = {recipeId: '1', recipeName: 'name', recipeContent: 'content', image: {imageId: 'imageId', imageUrl: 'imageUrl'}};
				$httpBackend.expect('PUT', '/api/recipe/1', expectedRecipe).respond(recipe);
				SpecUtils.clickElement($('#update-recipe-button'));
				SpecUtils.delayABit();
				scope.$digest();
				SpecUtils.delayABit();

				$httpBackend.flush();
				$httpBackend.verifyNoOutstandingExpectation();
				$httpBackend.verifyNoOutstandingRequest();
			});
		});
	});
});