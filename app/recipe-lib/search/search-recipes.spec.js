'use strict';

describe('The searchRecipes module', function () {

	beforeEach(angular.mock.module('recipe', 'my.templates'));

	var scope, compile, location, recipeService, recipeBookService;

	var recipes = [{recipeId: '1', recipeName: 'recipe 1', recipeContent: ''}, {recipeId: '2', recipeName: 'recipe 2', recipeContent: ''}];

	beforeEach(angular.mock.inject(function ($q, $rootScope, _$location_, $controller, $compile) {
		scope = $rootScope.$new();
		compile = $compile;
		location = _$location_;

		recipeService = {};
		recipeService.searchRecipes = SpecUtils.buildMockPromiseFunction(recipes);

		recipeBookService = {};
		recipeBookService.getRecipeBook = SpecUtils.buildMockPromiseFunction([]);

		$controller('SearchRecipesCtrl',
			{
				$scope: scope,
				$routeParams: {},
				userService: {},
				recipeService: recipeService,
				recipeBookService: recipeBookService,
				_: {},
				$location: location
			});
	}));

	it('when no query parameters exist on the url, it defaults to showing all recipes', function () {
			expect(recipeService.searchRecipes).toHaveBeenCalledWith(undefined);  //on initialize
			scope.$digest();
			expect(scope.recipeList).toBe(recipes);
	});

	describe('has links on the page for each recipe that takes the user to that recipes view page', function () {

		beforeEach(angular.mock.inject(function ($templateCache) {
			setFixtures($templateCache.get('recipe-lib/search/search-recipes.html'));

			var doc = angular.element(document);
			var fixture = doc.find('div');

			var elem = angular.element(fixture);
			compile(elem)(scope);
			scope.$digest();
		}));

		it('for recipe 1', function () {
			spyOn(location, 'url');

			var recipeRows = $('.recipe');
			expect(recipeRows.length).toBe(2);

			var recipeElement = $(recipeRows[0]);
			SpecUtils.clickElement(recipeElement);
			expect(location.url).toHaveBeenCalledWith('/view-recipe/1');
		});

		it('for recipe 2', function () {
			spyOn(location, 'url');

			var recipeRow = $('.recipe');
			expect(recipeRow.length).toBe(2);

			var recipeElement = $(recipeRow[1]);
			SpecUtils.clickElement(recipeElement);
			expect(location.url).toHaveBeenCalledWith('/view-recipe/2');
		});
	});

});