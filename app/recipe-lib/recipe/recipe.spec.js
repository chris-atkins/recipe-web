'use strict';

describe('the recipe directive', function () {

	var scope, location, userService, recipeBookService;

	beforeEach(angular.mock.module('recipe', 'my.templates'));

	function buildControllerWithRecipeAndBook(recipe, recipeBook, controllerName) {
		angular.module('recipe')
		.controller(controllerName, function ($scope) {
			$scope.recipe = recipe;
			$scope.recipeBook = recipeBook;
		});
	}

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

	function renderFixture(controllerName) {
		angular.mock.inject(function ($controller, $rootScope, $compile) {
			var outerScope = $rootScope.$new();
			$controller(controllerName, {
				$scope: outerScope
			});
			var fixture = angular.element(document).find('div');
			var elem = angular.element(fixture);

			$compile(elem)(outerScope);
			outerScope.$digest();
		});
	}

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
			setFixtures(
				'<div ngController="singleRecipeTestController">' +
				'     <div recipe item="recipe" book="recipeBook" class="recipeHolder"></div>' +
				'</div>'
			);
			renderFixture('singleRecipeTestController');
		});

		it('elements inside the div that uses the recipe directive while keeping the declaring div', function () {
			var recipeHolder = $('.recipeHolder');
			expect(recipeHolder).toBeVisible();
			expect(recipeHolder.children().length).toBeGreaterThan(0);
		});

		it('the name from the recipe it is built with', function () {
			var recipeName = $('.recipe-name');
			expect(recipeName.text()).toBe('theBestName');
		});

		it('a single dom element at the root that navigates to the recipe page when clicked', function () {
			spyOn(location, 'url');

			var recipeHolder = $('.recipeHolder');
			expect(recipeHolder).toBeVisible();
			expect(recipeHolder.children().length).toBe(1);

			var recipeElement = $(recipeHolder.children()[0]);
			SpecUtils.clickElement(recipeElement);
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
			buildControllerWithRecipeAndBook(recipe, recipeBook, 'singleRecipeTestController');
			setupRecipeController();

			setFixtures(
				'<div ngController="singleRecipeTestController">' +
				'     <div recipe item="recipe" book="recipeBook" class="recipeHolder"></div>' +
				'</div>'
			);
			renderFixture('singleRecipeTestController');
		});

		it('a label is shown that indicates the recipe is in the recipe book', function () {
			var recipeBookLabel = $('.in-recipe-book-indicator');
			expect(recipeBookLabel).toBeVisible();
			expect(recipeBookLabel.text()).toBe('In Recipe Book');
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
			buildControllerWithRecipeAndBook(recipe, recipeBook, 'singleRecipeTestController');
			setupRecipeController();

			setFixtures(
				'<div ngController="singleRecipeTestController">' +
				'     <div recipe item="recipe" book="recipeBook" class="recipeHolder"></div>' +
				'</div>'
			);
			renderFixture('singleRecipeTestController');
		});

		it('no label is shown that indicates the recipe is in the recipe book', function () {
			var recipeBookLabel = $('.in-recipe-book-indicator');
			expect(recipeBookLabel).not.toExist();
		});

		it('a button is shown that for allowing a recipe to be added to the recipe book', function () {
			var addToRecipeBookButton = $('.add-to-recipe-book-button');
			expect(addToRecipeBookButton).toBeVisible();
			expect(addToRecipeBookButton.text()).toBe('Add to Recipe Book');
		});

		it('when the Add to Recipe Book button is clicked, the recipe is added', function () {
			spyOn(recipeBookService, 'addToRecipeBook').and.returnValue(SpecUtils.resolvedPromise([]));

			var addToRecipeBookButton = $('.add-to-recipe-book-button');
			SpecUtils.clickElement(addToRecipeBookButton);
			expect(recipeBookService.addToRecipeBook).toHaveBeenCalledWith('notInBook');
		});

		it('when the Add to Recipe Book button is clicked, no page navigation happens', function () {
			spyOn(recipeBookService, 'addToRecipeBook').and.returnValue(SpecUtils.resolvedPromise([]));
			spyOn(location, 'url');

			var addToRecipeBookButton = $('.add-to-recipe-book-button');
			SpecUtils.clickElement(addToRecipeBookButton);
			expect(location.url).not.toHaveBeenCalled();
		});

		it('when the Add to Recipe Book button is clicked, the recipe is updated to show that it is now in the book', function () {
			spyOn(recipeBookService, 'addToRecipeBook').and.returnValue(SpecUtils.resolvedPromise([{recipeId: 'idInRecipeBook'}, {recipeId: 'someOtherId'}, {recipeId: 'notInBook'}]));
			SpecUtils.clickElement($('.add-to-recipe-book-button'));

			expect($('.add-to-recipe-book-button')).not.toExist();
			expect($('.in-recipe-book-indicator')).toBeVisible();
		});
	});
});