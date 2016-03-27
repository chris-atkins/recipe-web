'use strict';

angular.module('recipe.browseAllRecipes', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/browse-all-recipes', {
		templateUrl: 'browse-all/browse-all-recipes.html',
		controller: 'BrowseAllRecipesCtrl'
	});
}])

.controller('BrowseAllRecipesCtrl', function($scope, $http) {
	var recipeList = [{
			recipeName: 'First Recipe Name',
			recipeContent: 'First Recipe Content'
		}, {
			recipeName: 'Second Recipe Name',
			recipeContent: 'Second Recipe Content'
		}, {
			recipeName: 'Third Recipe Name',
			recipeContent: 'Third Recipe Content'
		}];

//	$http.get('http://127.0.0.1:8080/recipee7/api/recipe')
//		.success(function(data) {
//			recipeList = data;
//		})
//		.error(function(error) {
//			console.log('Error getting recipes:', error);
//		});
	
	$scope.getAllRecipes = function() {
		return recipeList;
	}
});