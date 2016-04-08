'use strict';

angular.module('recipe.searchRecipes', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/search-recipes', {
		templateUrl: 'search/search-recipes.html', 
		controller: 'SearchRecipesCtrl'
	});
}])

.controller('SearchRecipesCtrl', function($scope, $http) {
	
	$scope.recipeList = [];
	$scope.searchString = '';
	
	$scope.searchRecipes = function() {
		$http.get('/api/recipe?searchString=' + $scope.searchString)
			.success(function(data) {
				$scope.recipeList = data;
			})
			.error(function(error) {
				console.log('Error getting recipes:', error);
			});
	}
});