'use strict';

angular.module('recipe.searchRecipes', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/search-recipes', {
		templateUrl: 'search/search-recipes.html', 
		controller: 'SearchRecipesCtrl'
	});
}])

.controller('SearchRecipesCtrl', function($scope, $http, $routeParams, $location) {
	
	$scope.recipeList = [];
	$scope.searchString = '';
	$scope.searchHasOccurred = false;

	var queryParamSearchString = $routeParams.searchFor;
	if(queryParamSearchString) {
		$scope.searchString = queryParamSearchString;
		performSearchAndDisplayResults(queryParamSearchString);
	}

	$scope.searchRecipes = function() {
		$location.url('/search-recipes?searchFor=' + $scope.searchString);
	};

	function performSearchAndDisplayResults(searchString){
		$http.get('/api/recipe?searchString=' + searchString)
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