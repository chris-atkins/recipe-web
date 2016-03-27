'use strict';

angular.module('recipe.searchRecipes', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/search-recipes', {
		templateUrl: 'search/search-recipes.html', 
		controller: 'SearchRecipesCtrl'
	});
}])

.controller('SearchRecipesCtrl', function() {
	
});