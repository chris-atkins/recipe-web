'use strict';

describe('the recipe directive', function () {

	var scope, location, userService, recipeBookService, parentScope;

	var lastRemoveRecipeCallbackParam;

	var recipeHolder_Selector = '.recipeHolder';
	var recipeName_Selector = '.recipe-name';
	var inRecipeBookIndicator_Selector = '.in-recipe-book-indicator';
	var addToRecipeBookButton_Selector = '.add-to-recipe-book-button';
	var removeRecipeButtonSelector = '.remove-recipe-from-book-button';
	var recipeImage_Selector = '.recipe-image';

	beforeEach(angular.mock.module('recipe', 'my.templates'));

	function buildControllerWithRecipeAndBook(recipe, recipeBook) {
		angular.module('recipe')
		.controller("singleRecipeTestController", function ($scope) {
			$scope.recipe = recipe;
			$scope.recipeBook = recipeBook;
		});
	}

	var fixture =
		'<div ngController="singleRecipeTestController">' +
		'     <div recipe-element recipe="recipe" recipe-book="recipeBook" class="recipeHolder"></div>' +
		'</div>';

	function setupRecipeController() {
		angular.mock.inject(function ($controller, $rootScope, $compile, $location, _userService_, _recipeBookService_) {
			scope = $rootScope.$new();
			location = $location;
			userService = _userService_;
			recipeBookService = _recipeBookService_;
			$controller('recipeCtrl', {
				$scope: scope,
				$location: location,
				userService: userService,
				recipeBookService: recipeBookService
			});
		});
	}

	function renderFixture() {
		angular.mock.inject(function ($controller, $rootScope, $compile) {
			parentScope = $rootScope.$new();
			$controller("singleRecipeTestController", {
				$scope: parentScope
			});
			var fixture = angular.element(document).find('div');
			var elem = angular.element(fixture);

			$compile(elem)(parentScope);
			parentScope.$digest();
		});
	}

	describe('when recipe-book-mode is not set to true (defaults to false)', function () {

		describe('renders', function () {

			var recipe = {
				recipeId: 'theId',
				recipeName: 'theBestName',
				recipeContent: 'content',
				editable: true
			};

			var recipeBook = [];

			beforeEach(function () {
				buildControllerWithRecipeAndBook(recipe, recipeBook, 'singleRecipeTestController');
				setupRecipeController();
				setFixtures(fixture);
				renderFixture('singleRecipeTestController');
			});

			it('elements inside the div that uses the recipe directive while keeping the declaring div', function () {
				var recipeHolder = $(recipeHolder_Selector);
				expect(recipeHolder).toBeVisible();
				expect(recipeHolder.children().length).toBeGreaterThan(0);
			});

			it('the name from the recipe it is built with', function () {
				var recipeName = $(recipeName_Selector);
				expect(recipeName.text()).toBe('theBestName');
			});

			it('with the entire recipe linking to the view recipe page', function() {
				spyOn(location, 'url');

				var recipe = $('#theId');
				SpecUtils.clickElement(recipe);

				expect(location.url).toHaveBeenCalledWith('/view-recipe/theId');
			});
		});

		describe('when the recipe being rendered belongs to a users recipe book', function () {

			var recipe = {
				recipeId: 'idInRecipeBook',
				recipeName: 'theBestName',
				recipeContent: 'content',
				editable: true
			};

			var recipeBook = [{recipeId: 'idInRecipeBook'}, {recipeId: 'someOtherId'}];

			beforeEach(function () {
				buildControllerWithRecipeAndBook(recipe, recipeBook);
				setupRecipeController();
				setFixtures(fixture);
				renderFixture();
			});

			it('a label is shown that indicates the recipe is in the recipe book', function () {
				var recipeBookLabel = $(inRecipeBookIndicator_Selector);
				expect(recipeBookLabel).toBeVisible();
				expect(recipeBookLabel.text()).toBe(' In Recipe Book');
			});
		});


		describe('when the recipe being rendered does not belong to a users recipe book', function () {

			var recipe = {
				recipeId: 'notInBook',
				recipeName: 'theBestName',
				recipeContent: 'content',
				editable: true
			};

			var recipeBook = [{recipeId: 'idInRecipeBook'}, {recipeId: 'someOtherId'}];

			beforeEach(function () {
				buildControllerWithRecipeAndBook(recipe, recipeBook);
				setupRecipeController();
				setFixtures(fixture);
				renderFixture();
			});

			it('no label is shown that indicates the recipe is in the recipe book', function () {
				var recipeBookLabel = $(inRecipeBookIndicator_Selector);
				expect(recipeBookLabel).not.toExist();
			});

			it('a button is shown that for allowing a recipe to be added to the recipe book', function () {
				var addToRecipeBookButton = $(addToRecipeBookButton_Selector);
				expect(addToRecipeBookButton).toBeVisible();
				expect(addToRecipeBookButton.text()).toBe('Add to Recipe Book');
			});

			it('when the Add to Recipe Book button is clicked, the recipe is added', function () {
				spyOn(recipeBookService, 'addToRecipeBook').and.returnValue(SpecUtils.resolvedPromise([]));

				var addToRecipeBookButton = $(addToRecipeBookButton_Selector);
				SpecUtils.clickElement(addToRecipeBookButton);
				expect(recipeBookService.addToRecipeBook).toHaveBeenCalledWith('notInBook');
			});

			it('when the Add to Recipe Book button is clicked, no page navigation happens', function () {
				spyOn(recipeBookService, 'addToRecipeBook').and.returnValue(SpecUtils.resolvedPromise([]));
				spyOn(location, 'url');

				var addToRecipeBookButton = $(addToRecipeBookButton_Selector);
				SpecUtils.clickElement(addToRecipeBookButton);
				expect(location.url).not.toHaveBeenCalled();
			});

			it('when the Add to Recipe Book button is clicked, the recipe is updated to show that it is now in the book', function () {
				spyOn(recipeBookService, 'addToRecipeBook').and.returnValue(SpecUtils.resolvedPromise([{recipeId: 'idInRecipeBook'}, {recipeId: 'someOtherId'}, {recipeId: 'notInBook'}]));
				SpecUtils.clickElement($(addToRecipeBookButton_Selector));

				expect($(addToRecipeBookButton_Selector)).not.toExist();
				expect($(inRecipeBookIndicator_Selector)).toBeVisible();
			});

			it('when the parent controller changes its recipe book after the child has been rendered (but before the child has changed), the In Recipe Book label is updated', function () {
				expect($(addToRecipeBookButton_Selector)).toBeVisible();
				expect($(inRecipeBookIndicator_Selector)).not.toExist();

				parentScope.recipeBook = [{recipeId: 'notInBook'}];
				scope.$apply();

				expect($(addToRecipeBookButton_Selector)).not.toExist();
				expect($(inRecipeBookIndicator_Selector)).toBeVisible();
			});
		});
	});

	var recipeRemovalCallback = function (recipeParam) {
		lastRemoveRecipeCallbackParam = recipeParam;
	};

	function retrieveRemoveRecipeCallbackParam() {
		var result = lastRemoveRecipeCallbackParam;
		lastRemoveRecipeCallbackParam = null;
		return result;
	}

	function buildControllerWithRecipeAndOwningUserId(recipe, owningUserId) {
		angular.module('recipe')
		.controller("singleRecipeTestController", function ($scope) {
			$scope.recipe = recipe;
			$scope.owningUserId = owningUserId;
			$scope.recipeRemovalCallback = recipeRemovalCallback;
		});
	}

	var fixtureWithRemove =
		'<div ngController="singleRecipeTestController">' +
		'     <div recipe-element recipe="recipe" class="recipeHolder" recipe-book-mode="true" owning-user-id="{{owningUserId}}" recipe-removal-callback="recipeRemovalCallback"></div>' +
		'</div>';

	describe('when recipe-book-mode is set to TRUE', function () {

		var recipe = {
			recipeId: 'idToBeDeleted',
			recipeName: 'theBestName',
			recipeContent: 'content',
			editable: true
		};

		describe('and the logged in user owns the recipe book being shown', function () {

			beforeEach(function () {
				buildControllerWithRecipeAndOwningUserId(recipe, 'userId');
				setupRecipeController();

				spyOn(userService, 'getLoggedInUser').and.returnValue({userId: 'userId'});

				setFixtures(fixtureWithRemove);
				renderFixture();
			});

			it('a button exists that can remove a recipe', function () {
				var removeRecipeButton = $(removeRecipeButtonSelector);

				SpecUtils.clickElement(removeRecipeButton);

				expect(retrieveRemoveRecipeCallbackParam().recipeId).toBe('idToBeDeleted');
			});

			it('does not show the add to recipe book button', function () {
				var addToRecipeBookButton = $(addToRecipeBookButton_Selector);
				expect(addToRecipeBookButton.length).toBe(0);
			});
		});

		describe('and the logged in user does not own the recipe book being shown', function () {

			beforeEach(function () {
				buildControllerWithRecipeAndOwningUserId(recipe, 'userId');
				setupRecipeController();

				spyOn(userService, 'getLoggedInUser').and.returnValue({userId: 'differentUserId'});

				setFixtures(fixtureWithRemove);
				renderFixture();
			});

			it('the button that can remove a recipe is not shown', function () {
				var removeRecipeButton = $(removeRecipeButtonSelector);
				expect(removeRecipeButton.length).toBe(0);
			});

			it('does not show the add to recipe book button', function () {
				var addToRecipeBookButton = $(addToRecipeBookButton_Selector);
				expect(addToRecipeBookButton.length).toBe(0);
			});
		});
	});

	describe('images', function () {

		describe('renders when the recipe has an image url', function () {

			var recipe = {
				recipeId: 'theId',
				recipeName: 'theBestName',
				recipeContent: 'content',
				image: {
					imageId: 'imageId',
					imageUrl: 'http://imageUrl/'
				},
				editable: true
			};

			var recipeBook = [];

			beforeEach(function () {
				buildControllerWithRecipeAndBook(recipe, recipeBook, 'singleRecipeTestController');
				setupRecipeController();
				setFixtures(fixture);
				renderFixture('singleRecipeTestController');
			});

			it('image is shown', function () {
				var recipeImage = $(recipeImage_Selector);
				expect(recipeImage).toBeVisible();
				expect(recipeImage.prop('src').toLowerCase()).toBe('http://imageurl/');
			});
		});

		describe('renders when the recipe does not have an image url', function () {

			var recipe = {
				recipeId: 'theId',
				recipeName: 'theBestName',
				recipeContent: 'content',
				image: null,
				editable: true
			};

			var recipeBook = [];

			beforeEach(function () {
				buildControllerWithRecipeAndBook(recipe, recipeBook, 'singleRecipeTestController');
				setupRecipeController();
				setFixtures(fixture);
				renderFixture('singleRecipeTestController');
			});

			it('image tag is not shown', function () {
				var recipeImage = $(recipeImage_Selector);
				expect(recipeImage.length).toBe(0);
			});
		});
	});
});