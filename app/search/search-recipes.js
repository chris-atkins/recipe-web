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
	$scope.searchHasOccurred = false;
	
	$scope.searchRecipes = function() {
		$http.get('/api/recipe?searchString=' + $scope.searchString)
			.success(function(data) {
				$scope.recipeList = data;
				$scope.searchHasOccurred = true;
			})
			.error(function(error) {
				console.log('Error getting recipes:', error);
			});
	}
})

.directive('focus', function($timeout) {
	return {
		scope : {
			trigger : '@focus'
		},
		link : function(scope, element) {
			scope.$watch('trigger', function(value) {
				if (value === "true") {
					$timeout(function() {
						element[0].focus();
					});
				}
			});
		}
	};
});