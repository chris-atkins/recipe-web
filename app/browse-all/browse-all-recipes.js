'use strict';

angular.module('recipe.browseAllRecipes', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/browse-all-recipes', {
		templateUrl: 'browse-all/browse-all-recipes.html',
		controller: 'BrowseAllRecipesCtrl'
	});
}])

.controller('BrowseAllRecipesCtrl', function() {
	
});