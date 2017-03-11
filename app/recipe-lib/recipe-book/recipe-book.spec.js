'use strict';

describe('the recipe book module', function () {

	var scope;
	var routeParams;
	var recipeBookService;
	var userService;
	var recipeService;
	var httpBackend;
	var location;

	var recipe1 = {'recipeId':'1','recipeName':'recipe1Name','recipeContent':'recipe1Content','editable':false};
	var recipe2 = {'recipeId':'2','recipeName':'recipe2Name','recipeContent':'recipe2Content','editable':true};

	var recipeBookOwner = {'userId': 'userId1', 'userName': 'Me', 'userEmail': 'i'};
	var userThatIsNotOwner = {'userId': 'userId2', 'userName': 'someoneElse', 'userEmail': 'a@b.com'};

	beforeEach(angular.mock.module('my.templates', 'recipe'));

	beforeEach(angular.mock.inject(function ($rootScope, $httpBackend, _$location_, $controller) {
		scope = $rootScope;
		httpBackend = $httpBackend;
		location = _$location_;

		routeParams = {userId: 'userId1'};

		recipeBookService = {};
		recipeBookService.removeRecipeFromBook = SpecUtils.buildMockPromiseFunction([]);
		recipeBookService.getRecipeBook = SpecUtils.buildMockPromiseFunction([]);

		userService = {};
		userService.getLoggedInUser = jasmine.createSpy('').and.returnValue(recipeBookOwner);

		recipeService = {};
		recipeService.allRecipesInUserBook = SpecUtils.buildMockPromiseFunction([recipe1, recipe2]);

		$controller('RecipeBookCtrl', {
			$scope: scope,
			$routeParams: routeParams,
			recipeService: recipeService,
			recipeBookService: recipeBookService,
			userService: userService
		});

		httpBackend.expect('GET', 'api/user/userId1').respond(recipeBookOwner);
		httpBackend.flush();
	}));

	it('displays the name of the owner of the recipe book', function () {
		SpecUtils.loadPage('recipe-lib/recipe-book/recipe-book.html', scope);

		var title = $('#page-title');
		expect(title.text()).toBe('Recipe Book: Me');
	});

	it('renders all recipes in a users recipe book', function () {
		SpecUtils.loadPage('recipe-lib/recipe-book/recipe-book.html', scope);

		var recipeNames = $('.recipe-name');
		expect(recipeNames.length).toBe(2);

		expect(containsName(recipeNames, 'recipe1Name')).toBe(true);
		expect(containsName(recipeNames, 'recipe2Name')).toBe(true);
	});

	function containsName(recipeNames, expectedName) {
		for (var i = 0; i < recipeNames.length; i++) {
			if (recipeNames[i].innerText === expectedName) {
				return true;
			}
		}
		return false;
	}

	it('has a user section', function () {
		SpecUtils.loadPage('recipe-lib/recipe-book/recipe-book.html', scope);
		var userSection = $('.user-section');

		expect(userSection.length).toBe(1);
	});

	it('can navigate to the home screen', function () {
		spyOn(location, 'url');
		SpecUtils.loadPage('recipe-lib/recipe-book/recipe-book.html', scope);

		var homeButton = $('#home-button');
		SpecUtils.clickElement(homeButton);

		expect(location.url).toHaveBeenCalledWith('/home');
	});

	describe('clicking on a recipe will navigate to that recipes page', function () {

		it('for recipe 1', function () {
			spyOn(location, 'url');
			SpecUtils.loadPage('recipe-lib/recipe-book/recipe-book.html', scope);

			var recipe = $('#1 .view-recipe-link');
			SpecUtils.clickElement(recipe);

			expect(location.url).toHaveBeenCalledWith('/view-recipe/1');
		});

		it('for recipe 2', function () {
			spyOn(location, 'url');
			SpecUtils.loadPage('recipe-lib/recipe-book/recipe-book.html', scope);

			var recipe = $('#2 .view-recipe-link');
			SpecUtils.clickElement(recipe);

			expect(location.url).toHaveBeenCalledWith('/view-recipe/2');
		});
	});

	it('can remove a recipe from recipe book if the recipe book belongs to the logged in user', function () {
		userService.getLoggedInUser = jasmine.createSpy('').and.returnValue(recipeBookOwner);

		SpecUtils.loadPage('recipe-lib/recipe-book/recipe-book.html', scope);
		var removeLink = $('#2 .remove-recipe-from-book-button');

		SpecUtils.clickElement(removeLink);

		expect(recipeBookService.removeRecipeFromBook).toHaveBeenCalledWith('2');
	});

	it('can not remove a recipe from recipe book if the logged in user is not the owner of the recipe book', function () {
		userService.getLoggedInUser = jasmine.createSpy('').and.returnValue(userThatIsNotOwner);

		SpecUtils.loadPage('recipe-lib/recipe-book/recipe-book.html', scope);
		var removeLink = $('#2 .remove-recipe-from-book-button');

		expect(removeLink.length).toBe(0);
	});

	it('if user is not the recipe book owner a N/A message is given for actions', function () {
		userService.getLoggedInUser = jasmine.createSpy('').and.returnValue(userThatIsNotOwner);

		SpecUtils.loadPage('recipe-lib/recipe-book/recipe-book.html', scope);
		var actionLabel = $('#2 .no-actions-possible-label');

		expect(actionLabel.text()).toBe('N/A');
	});
});