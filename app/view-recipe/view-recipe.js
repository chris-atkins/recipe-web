'use strict';

angular.module('recipe.viewRecipe', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/view-recipe/:recipeId', {
		templateUrl: 'view-recipe/view-recipe.html',
		controller: 'ViewRecipeCtrl'
	});
}])

.controller('ViewRecipeCtrl', function($scope) {
	
});