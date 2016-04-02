'use strict';

angular.module('recipe.viewRecipe', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/view-recipe/:recipeId', {
		templateUrl: 'view-recipe/view-recipe.html',
		controller: 'ViewRecipeCtrl'
	});
}])

.controller('ViewRecipeCtrl', function($scope, $http, $routeParams) {
	
	$scope.recipe = {};
	
	$http.get('api/recipe/' + $routeParams.recipeId)
		.success(function(recipe) {
			$scope.recipe = recipe;
		})
		.error(function(error) {
			console.log('error retrieving recipe: ', error);
		});
});