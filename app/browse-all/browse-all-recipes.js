'use strict';

angular.module('recipe.browseAllRecipes', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/browse-all-recipes', {
		templateUrl: 'browse-all/browse-all-recipes.html',
		controller: 'BrowseAllRecipesCtrl'
	});
}])

.controller('BrowseAllRecipesCtrl', function($scope, $http) {
	
	var recipeList = [];

	$http.get('/api/recipe')
		.success(function(data) {
			recipeList = data;
		})
		.error(function(error) {
			console.log('Error getting recipes:', error);
		});
	
	$scope.getAllRecipes = function() {
		return recipeList;
	}
});