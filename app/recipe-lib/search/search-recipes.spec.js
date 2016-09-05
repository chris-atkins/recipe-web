'use strict';

describe('The searchRecipes controller', function () {

	var $controller;

	beforeEach(angular.mock.module('recipe.searchRecipes'));
	beforeEach(angular.mock.module('recipe.recipe.service'));

	beforeEach(inject(function (_$controller_) {
		$controller = _$controller_;
	}));

	it('when no query parameters exist on the url, it defaults to showing all recipes', function () {
		angular.mock.inject(function (recipeService, $q) {

			var $scope = {};
			var recipes = [{id: '1'}, {id: '2'}];
			var recipesPromise = $q.defer(recipes).promise;
			var recipeServiceSpy = spyOn(recipeService, 'searchRecipes').and.returnValue(recipesPromise);
			var recipeBookService = {};
			recipeBookService.getRecipeBook = jasmine.createSpy('getRecipeBook').and.returnValue($q.defer([]).promise);

			$controller('SearchRecipesCtrl',
				{
					$scope: $scope,
					$routeParams: {},
					userService: {},
					recipeBookService: recipeBookService,
					_: {}
				});

			expect(recipeServiceSpy).toHaveBeenCalledWith(undefined);

			recipesPromise.then(function() {
				expect($scope.recipeList).toBe(recipes);
			});
		});
	});
});