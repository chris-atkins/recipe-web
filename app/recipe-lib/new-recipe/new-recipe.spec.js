'use strict';

describe('the new recipe module', function () {


	beforeEach(angular.mock.module('recipe', 'my.templates'));

	var scope, imageUploadScope, upload, location, userService, recipeService;

	var imageUploadToggleSelector = '.image-upload-toggle';

	beforeEach(async function () {
		await angular.mock.inject(function ($controller, $rootScope, _Upload_, $location, _userService_, _recipeService_) {
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
		await SpecUtils.waitForAngular(scope);
	});

	afterEach(async function () {
		await SpecUtils.waitForAngular(scope);
		scope = null;
		imageUploadScope = null;
		upload = null;
		location = null;
		userService = null;
		recipeService = null;
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
			await SpecUtils.delayABit(1000);
			expect($(imageUploadToggleSelector)).toBeVisible();
			expect($(imageUploadToggleSelector).text()).toBe(' Upload Image');
		});

		it('if an image has been uploaded, includes the uploaded image when saving the recipe', async function () {
			jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
			await loadPage();
			upload.upload = SpecUtils.buildMockPromiseFunction({data: {body: '{"imageId":"imageId", "imageUrl":"imageUrl"}'}, status: 200});
			recipeService.saveRecipe = SpecUtils.buildMockPromiseFunction({});

			var modalShownPromise = new Promise(function(resolve) {
				$('.image-upload-modal').on('shown.bs.modal', function () {
					resolve();
				});
			});

			SpecUtils.clickElement($(imageUploadToggleSelector));
			await SpecUtils.waitForAngular(scope);

			await modalShownPromise;

			await SpecUtils.waitForElement('.upload-image-button', 5000);

			SpecUtils.clickElement($('.upload-image-button'));
			await SpecUtils.waitForAngular(scope);

			SpecUtils.clickElement($('.close-upload-image-button'));
			await SpecUtils.removeModalBackdrop();
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
			await SpecUtils.waitForElement('.recipe-image', 5000);
			await SpecUtils.delayABit(1000);

			expect($('.recipe-image')).toBeVisible();
			expect($('.recipe-image').attr('src')).toBe('hi');
		});
	});
});