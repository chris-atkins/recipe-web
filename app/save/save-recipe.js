'use strict';

angular.module('recipe.saveRecipe', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/save-recipe', {
		templateUrl: 'save/save-recipe.html',
		controller: 'SaveRecipeCtrl'
	});
}])

.controller('SaveRecipeCtrl', [function() {
	
}]);