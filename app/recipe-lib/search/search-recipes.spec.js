'use strict';

describe('The searchRecipes controller', function () {

	var $controller;

	beforeEach(angular.mock.module('recipe.searchRecipes'));
	beforeEach(angular.mock.module('recipe.recipe.service'));

	beforeEach(inject(function (_$controller_) {
		$controller = _$controller_;
	}));

	it('when no query parameters exist on the url, it defaults to showing all recipes', function () {
		angular.mock.inject(function ($q, $rootScope) {
			var $scope = $rootScope.$new();
			var recipes = [{id: '1'}, {id: '2'}];

			var recipeService = {};
			recipeService.searchRecipes = SpecUtils.buildMockPromiseFunction(recipes);

			var recipeBookService = {};
			recipeBookService.getRecipeBook = SpecUtils.buildMockPromiseFunction([])

			$controller('SearchRecipesCtrl',
				{
					$scope: $scope,
					$routeParams: {},
					userService: {},
					recipeService: recipeService,
					recipeBookService: recipeBookService,
					_: {}
				});

			expect(recipeService.searchRecipes).toHaveBeenCalledWith(undefined);

			$scope.$digest();
			expect($scope.recipeList).toBe(recipes);
		});
	});
});