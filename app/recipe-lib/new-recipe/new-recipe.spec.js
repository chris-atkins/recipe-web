'use strict';

describe('the new recipe module', function () {


	beforeEach(angular.mock.module('recipe', 'my.templates'));

	var scope, imageUploadScope, upload, location, userService, recipeService;

	var imageUploadToggleSelector = '.image-upload-toggle';

	beforeEach(async function () {
		angular.mock.inject(function ($controller, $rootScope, _Upload_, $location, _userService_, _recipeService_) {
			scope = $rootScope.$new();
			location = $location;
			userService = _userService_;
			recipeService = _recipeService_;

			spyOn(userService, 'isExternalLoginBeingAttempted').and.returnValue(false);

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
		await SpecUtils.delayABit();
	});

	async function loadPage() {
		angular.mock.inject(function ($httpBackend, $templateCache, $compile, $rootScope) {
			setFixtures($templateCache.get('recipe-lib/new-recipe/new-recipe.html'));

			var fixture = angular.element(document).find('div')[0];
			var elem = angular.element(fixture);

			$compile(elem)(scope);
			$rootScope.$digest();
		});
		await SpecUtils.waitForAngular(scope);
	}

	describe('when logged in', function () {

		beforeEach(async function () {
			spyOn(userService, 'isLoggedIn').and.returnValue(true);
		});

		it('contains the upload image module', async function () {
			await loadPage();
			await SpecUtils.waitForElement(imageUploadToggleSelector, 3000);
			expect($(imageUploadToggleSelector)).toBeVisible();
			expect($(imageUploadToggleSelector).text()).toBe(' Upload Image');
		});

		function removeModalBackdrop() {
			var back = $('.modal-backdrop');
			back.remove();
		}

		it('if an image has been uploaded, includes the uploaded image when saving the recipe', async function () {
			jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // Increase timeout for modal
			await loadPage();
			upload.upload = SpecUtils.buildMockPromiseFunction({data: {body: '{"imageId":"imageId", "imageUrl":"imageUrl"}'}, status: 200});
			recipeService.saveRecipe = SpecUtils.buildMockPromiseFunction({});

			// Create a promise that resolves when modal is shown
			var modalShownPromise = new Promise(function(resolve) {
				$('.image-upload-modal').on('shown.bs.modal', function () {
					resolve();
				});
			});

			// Click to open modal
			SpecUtils.clickElement($(imageUploadToggleSelector));
			await SpecUtils.waitForAngular(scope);

			// Wait for modal to be shown
			await modalShownPromise;

			// Wait for upload button to be visible and clickable
			await SpecUtils.waitForElement('.upload-image-button', 2000);

			SpecUtils.clickElement($('.upload-image-button'));
			await SpecUtils.waitForAngular(scope);

			SpecUtils.clickElement($('.close-upload-image-button'));
			removeModalBackdrop();
			await SpecUtils.waitForAngular(scope);

			var expectedRecipe = {recipeName: '', recipeContent: '', image: {imageId: 'imageId', imageUrl: 'imageUrl'}};

			SpecUtils.clickElement($('.save-button'));
			await SpecUtils.waitForAngular(scope);
			expect(recipeService.saveRecipe).toHaveBeenCalledWith(expectedRecipe);
		});

		it('once an image has been saved, displays it on screen', async function() {
			await loadPage();
			expect($('.recipe-image')).not.toBeVisible();

			scope.imageSaved({imageUrl:'hi'});
			await SpecUtils.waitForAngular(scope);
			await SpecUtils.waitForElement('.recipe-image', 3000);

			expect($('.recipe-image')).toBeVisible();
			expect($('.recipe-image').attr('src')).toBe('hi');
		});
	});
});