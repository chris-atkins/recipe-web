'use strict';

angular.module('recipe.newRecipe', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/new-recipe', {
		templateUrl: 'new-recipe/new-recipe.html',
		controller: 'NewRecipeCtrl'
	});
}])

.controller('NewRecipeCtrl', function($scope, $http) {
	
	$scope.newRecipeName = '';
	$scope.newRecipeContent = '';
	
	$scope.saveRecipe = function() {
		var recipeToSave = {
			recipeName: $scope.newRecipeName, 
			recipeContent: $scope.newRecipeContent
		};
		
		$http.post('/api/recipe', recipeToSave)
			.success(function(data) {
				//don't do anything
			})
			.error(function(error) {
				console.log('failure saving recipe:', error);
			});
	}
});