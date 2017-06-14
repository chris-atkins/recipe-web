'use strict';

describe('The image-upload module', function () {

	var scope, upload, timeout, parentScope, userService;
	var imageSavedCallbackCalled = false;
	var imageSavedCallbackParam;

	beforeEach(angular.mock.module('recipe', 'my.templates', 'ngFileUpload', 'ngImgCrop'));

	function buildFixtureControllerWithRecipe(recipe) {
		angular.module('recipe')
		.controller("recipeTestEditController", function ($scope) {
			$scope.recipe = recipe;

			$scope.callbackFunction = function (image) {
				imageSavedCallbackCalled = true;
				imageSavedCallbackParam = image;
			};
		});
	}

	var fixture =
		'<div ngController="recipeTestEditController">' +
		'     <div image-upload recipe="recipe" image-saved-callback="callbackFunction" class="image-upload-holder"></div>' +
		'</div>';

	function setupImageUploadController() {
		angular.mock.inject(function ($controller, $rootScope, _Upload_, $timeout) {
			scope = $rootScope.$new();

			upload = _Upload_;
			spyOn(upload, 'dataUrltoBlob').and.returnValue('theFile');

			timeout = $timeout;
			$controller('imageUploadCtrl', {
				$scope: scope,
				Upload: upload,
				$timeout: timeout,
				userService: userService
			});
		});
	}

	function renderFixture() {
		angular.mock.inject(function ($controller, $rootScope, $compile) {
			parentScope = $rootScope.$new();
			$controller("recipeTestEditController", {
				$scope: parentScope
			});
			var fixture = angular.element(document).find('div');
			var elem = angular.element(fixture);

			$compile(elem)(parentScope);
			parentScope.$digest();
		});
	}

	describe('when rendered', function () {

		var recipe = {
			recipeId: 'theId',
			recipeName: 'name',
			recipeContent: 'content',
			editable: true
		};

		beforeEach(function () {
			buildFixtureControllerWithRecipe(recipe);
			setupImageUploadController();
			setFixtures(fixture);
			renderFixture();
		});

		it('shows a file chooser, a place to show the image and the cropped, an upload button', function () {
			expect($('.select-image-button')).toBeVisible();
			expect($('.selected-image')).toBeVisible();
			expect($('.cropped-image')).toBeVisible();
			expect($('.upload-image-button')).toBeVisible();

			expect($('.success-message')).not.toBeVisible();
			expect($('.error-message')).not.toBeVisible();
		});

		it('uploads the image when the upload button is pressed', function () {
			upload.upload = SpecUtils.buildMockPromiseFunction({data: 'data', status: 200});

			var expectedArgument = {
				url: '/api/recipe/theId/image',
				data: {
					file: 'theFile'
				}
			};

			SpecUtils.clickElement($('.upload-image-button'));
			expect(upload.upload).toHaveBeenCalledWith(expectedArgument);
		});

		it('displays a processing message while an image is being loaded', function () {
			expect($('.processing-message')).not.toBeVisible();

			var childScope = parentScope.$$childTail;  //scope is not really what is used by the image-uploa on the page - this is the only way I've found to get a hold on it
			childScope.startProcessing();  //not sure how to correctly test the initiation of the processing - it is a hook on the file-upload tag

			parentScope.$apply();

			expect($('.processing-message')).toBeVisible();
			expect($('.processing-message').text()).toBe(' Processing...');

			childScope.croppedDataUrl = 'something new';
			parentScope.$apply();

			expect($('.processing-message')).not.toBeVisible();
		});

		it('displays a loading message while upload is in progress', function () {
			angular.mock.inject(function ($httpBackend) {
				$httpBackend.expect('POST', '/api/recipe/theId/image').respond(200, {data: 'data'});

				SpecUtils.clickElement($('.upload-image-button'));
				expect($('.loading-message')).toBeVisible();
				expect($('.loading-message').text()).toBe(' Working...');

				$httpBackend.flush();
				expect($('.error-message')).not.toBeVisible();
			});
		});

		it('displays a success message when upload is completed', function () {
			angular.mock.inject(function ($httpBackend) {
				$httpBackend.expect('POST', '/api/recipe/theId/image').respond(200, {data: 'data'});

				SpecUtils.clickElement($('.upload-image-button'));
				$httpBackend.flush();

				expect($('.success-message')).toBeVisible();
				expect($('.success-message').text()).toBe('Image uploaded.');
				expect($('.error-message')).not.toBeVisible();
			});
		});

		it('calls back to the callback function when completed', function () {
			angular.mock.inject(function ($httpBackend) {
				imageSavedCallbackCalled = false;

				$httpBackend.expect('POST', '/api/recipe/theId/image').respond(200, {data: 'data'});

				SpecUtils.clickElement($('.upload-image-button'));
				$httpBackend.flush();

				expect(imageSavedCallbackCalled).toBe(true);
				expect(imageSavedCallbackParam).toEqual({data: 'data'});
			});
		});

		it('displays an error message when upload is not successful', function () {
			angular.mock.inject(function ($httpBackend) {
				$httpBackend.expect('POST', '/api/recipe/theId/image').respond(500, {message: 'error'});

				SpecUtils.clickElement($('.upload-image-button'));
				$httpBackend.flush();

				expect($('.success-message')).not.toBeVisible();
				expect($('.error-message')).toBeVisible();
			});
		});
	});
});