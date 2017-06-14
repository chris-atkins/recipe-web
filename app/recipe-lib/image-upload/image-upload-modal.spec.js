'use strict';

describe('the image upload modal module', function () {

	var scope, upload, timeout, parentScope, imageUploadScope;
	var imageSavedCallbackCalled = false;
	var imageSavedCallbackParam;

	beforeEach(angular.mock.module('recipe', 'my.templates', 'ngFileUpload', 'ngImgCrop'));

	var recipe = {recipeId: 'theId', recipeName: 'name', recipeContent: 'content', editable: true, image: null};

	function buildFixtureControllerWithRecipe(recipe) {
		angular.module('recipe')
		.controller("recipeTestImageUploadModalController", function ($scope) {
			$scope.recipe = recipe;

			$scope.callbackFunction = function (image) {
				imageSavedCallbackCalled = true;
				imageSavedCallbackParam = image;
			};
		});
	}

	var fixture =
		'<div ngController="recipeTestImageUploadModalController">' +
		'     <image-upload-modal recipe="recipe" image-saved-callback="callbackFunction" class="image-upload-holder"></image-upload-modal>' +
		'</div>';

	function setupControllers() {
		angular.mock.inject(function ($controller, $rootScope, _Upload_, $timeout) {
			imageUploadScope = $rootScope.$new();

			upload = _Upload_;
			spyOn(upload, 'dataUrltoBlob').and.returnValue('theFile');

			timeout = $timeout;
			$controller('imageUploadCtrl', {
				$scope: imageUploadScope,
				Upload: upload,
				$timeout: timeout,
				userService: undefined
			});

			scope = $rootScope.$new();
			$controller('imageUploadModalCtrl', {
				$scope: scope
			});
		});
	}

	function renderFixture() {
		angular.mock.inject(function ($controller, $rootScope, $compile) {
			parentScope = $rootScope.$new();
			$controller("recipeTestImageUploadModalController", {
				$scope: parentScope
			});
			var fixture = angular.element(document).find('div');
			var elem = angular.element(fixture);

			$compile(elem)(parentScope);
			$rootScope.$digest();
		});
	}


	beforeEach(function () {
		buildFixtureControllerWithRecipe(recipe);
		setupControllers();
		setFixtures(fixture);
		renderFixture();
	});


	var imageUploadToggleSelector = '.image-upload-toggle';
	var imageUploadModalSelector = '.image-upload-modal';
	var imageUploadSectionSelector = '.image-upload-modal .modal-body .image-upload-section';
	var closeUploadSelector = '.image-upload-modal .modal-footer .close-upload-image-button';
	var closeUploadXSelector = '.image-upload-modal .modal-header .close-upload-image-x';
	var imageUploadTitleSelector = '.image-upload-modal .modal-header .modal-title';

	it('starts showing the image upload button but not the modal', function () {
		expect($(imageUploadToggleSelector)).toBeVisible();
		expect($(imageUploadToggleSelector).text()).toBe(' Upload Image');
		expect($(imageUploadModalSelector)).not.toBeVisible();
	});

	it('shows modal elements when the image upload button is pressed', function (done) {
		var toggle = $(imageUploadToggleSelector);
		expect($(imageUploadSectionSelector)).not.toBeVisible();
		SpecUtils.clickElement(toggle);

		$(imageUploadModalSelector).on('shown.bs.modal', function () {
			expect($(imageUploadModalSelector)).toBeVisible();

			var title = $(imageUploadTitleSelector);
			expect(title).toBeVisible();
			expect(title.text()).toBe('Image Upload');

			var closeXButton = $(closeUploadXSelector);
			expect(closeXButton).toBeVisible();

			expect($(imageUploadSectionSelector)).toBeVisible();

			var closeButton = $(closeUploadSelector);
			expect(closeButton).toBeVisible();
			expect(closeButton.text()).toBe('Close');

			SpecUtils.clickElement($(closeUploadSelector));
			$(imageUploadModalSelector).on('hidden.bs.modal', function () {
				expect($(imageUploadSectionSelector)).not.toBeVisible();
				done();
			});
		});
	});

	it('shows and hides the image upload section when pressing the open and close buttons', function (done) {
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

	it('shows and hides the image upload section when pressing the open and X buttons', function (done) {
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

	it('calls back to the callback function when an image is uploaded', function (done) {
		angular.mock.inject(function ($httpBackend) {
			imageSavedCallbackCalled = false;

			var toggle = $(imageUploadToggleSelector);
			expect($(imageUploadSectionSelector)).not.toBeVisible();
			SpecUtils.clickElement(toggle);

			$(imageUploadModalSelector).on('shown.bs.modal', function () {

				$httpBackend.expect('POST', '/api/recipe/theId/image').respond(200, {data: 'data'});

				SpecUtils.clickElement($('.upload-image-button'));
				$httpBackend.flush();

				expect(imageSavedCallbackCalled).toBe(true);
				expect(imageSavedCallbackParam).toEqual({data: 'data'});

				SpecUtils.clickElement($(closeUploadSelector));
				$(imageUploadModalSelector).on('hidden.bs.modal', function () {
					expect($(imageUploadSectionSelector)).not.toBeVisible();
					done();
				});
			});
		});
	});

});