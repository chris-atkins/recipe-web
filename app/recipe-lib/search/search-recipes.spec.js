'use strict';

describe('The searchRecipes controller', function () {

	var $controller;

	beforeEach(angular.mock.module('recipe.searchRecipes'));
	beforeEach(angular.mock.module('recipe.recipe.service'));

	beforeEach(inject(function (_$controller_) {
		$controller = _$controller_;
	}));

	it('when no query parameters exist on the url, it defaults to showing all recipes', function (done) {
		angular.mock.inject(function ($q, $rootScope) {
			var $scope = $rootScope.$new();

			var recipes = [{id: '1'}, {id: '2'}];
			var recipesDefferred = $q.defer();
			var recipesPromise = recipesDefferred.promise;
			recipesDefferred.resolve(recipes);
			var recipeService = {};
			recipeService.searchRecipes = jasmine.createSpy('searchRecipes').and.returnValue(recipesPromise);

			var recipeBookDeferred = $q.defer();
			recipeBookDeferred.resolve([]);
			var recipeBookService = {};
			recipeBookService.getRecipeBook = jasmine.createSpy('getRecipeBook').and.returnValue(recipeBookDeferred.promise);

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

			recipesPromise.then(function() {
				expect($scope.recipeList).toBe(recipes);
			}).then(done, done.fail);

			$scope.$digest();
		});
	});
});