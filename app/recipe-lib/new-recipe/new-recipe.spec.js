'use strict';

xdescribe('the new recipe module', function () {


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
	});

	function loadPage() {
		angular.mock.inject(function ($httpBackend, $templateCache, $compile) {
			setFixtures($templateCache.get('recipe-lib/new-recipe/new-recipe.html'));

			var fixture = angular.element(document).find('div')[0];
			var elem = angular.element(fixture);

			$compile(elem)(scope);
			scope.$digest();
		});
	}

	describe('when logged in', function () {

		beforeEach(function() {
			spyOn(userService, 'isLoggedIn').and.returnValue(true);
		});

		it('contains the upload image module', function () {
			loadPage();
			expect($(imageUploadToggleSelector)).toBeVisible();
			expect($(imageUploadToggleSelector).text()).toBe(' Upload Image');
		});

		it('if an image has been uploaded, includes the uploaded image when saving the recipe', function () {
			loadPage();
			upload.upload = SpecUtils.buildMockPromiseFunction({data: {imageId: 'imageId', imageUrl: 'imageUrl'}});
			recipeService.saveRecipe = SpecUtils.buildMockPromiseFunction({recipeId: '1', recipeName: 'name', recipeContent: 'content', image: {imageId: 'imageId', imageUrl: 'imageUrl'}});

			SpecUtils.clickElement($(imageUploadToggleSelector));
			SpecUtils.clickElement($('.upload-image-button'));

			var expectedRecipe = {recipeName: '', recipeContent: '', image: {imageId: 'imageId', imageUrl: 'imageUrl'}};


			SpecUtils.clickElement($('.save-button'));

			expect(recipeService.saveRecipe).toHaveBeenCalledWith(expectedRecipe);
		});


	});
});