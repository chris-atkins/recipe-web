'use strict';

describe('the new recipe module', function () {


	beforeEach(angular.mock.module('recipe', 'my.templates'));

	var scope, imageUploadScope, upload, location, userService, recipeService;

	var imageUploadToggleSelector = '.image-upload-toggle';

	beforeEach(function () {
		angular.mock.inject(function ($controller, $rootScope, _Upload_, $location, _userService_, _recipeService_) {
			scope = $rootScope.$new();
			location = $location;
			userService = _userService_;
			recipeService = _recipeService_;
			$controller('NewRecipeCtrl', {
				$scope: scope,
				$location: location,
				userService: userService,
				recipeService: recipeService
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

	function loadPage() {
		angular.mock.inject(function ($httpBackend, $templateCache, $compile) {
			setFixtures($templateCache.get('recipe-lib/new-recipe/new-recipe.html'));

			var fixture = angular.element(document).find('div')[0];
			var elem = angular.element(fixture);

			$compile(elem)(scope);
			scope.$digest();
			SpecUtils.delayABit();
		});
		SpecUtils.delayABit();
	}

	describe('when logged in', function () {

		beforeEach(function () {
			spyOn(userService, 'isLoggedIn').and.returnValue(true);
		});

		it('contains the upload image module', function () {
			loadPage();
			expect($(imageUploadToggleSelector)).toBeVisible();
			expect($(imageUploadToggleSelector).text()).toBe(' Upload Image');
		});

		function removeModalBackdrop() {
			var back = $('.modal-backdrop');
			back.remove();
		}

		it('if an image has been uploaded, includes the uploaded image when saving the recipe', function (done) {
			loadPage();
			upload.upload = SpecUtils.buildMockPromiseFunction({data: {body: '{"imageId":"imageId", "imageUrl":"imageUrl"}'}, status: 200});
			recipeService.saveRecipe = SpecUtils.buildMockPromiseFunction({});

			SpecUtils.clickElement($(imageUploadToggleSelector));

			$('.image-upload-modal').on('shown.bs.modal', function () {
				SpecUtils.clickElement($('.upload-image-button'));
				SpecUtils.clickElement($('.close-upload-image-button'));
				removeModalBackdrop();

				var expectedRecipe = {recipeName: '', recipeContent: '', image: {imageId: 'imageId', imageUrl: 'imageUrl'}};

				SpecUtils.clickElement($('.save-button'));
				expect(recipeService.saveRecipe).toHaveBeenCalledWith(expectedRecipe);
				done();
			});
		});

		it('once an image has been saved, displays it on screen', function() {
			loadPage();
			expect($('.recipe-image')).not.toBeVisible();

			scope.imageSaved({imageUrl:'hi'});
			scope.$digest();
			SpecUtils.delayABit();
			SpecUtils.delayABit();

			expect($('.recipe-image')).toBeVisible();
			expect($('.recipe-image').attr('src')).toBe('hi');
		});
	});
});