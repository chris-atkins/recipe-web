'use strict';

angular.module('recipe')

.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/new-recipe', {
		templateUrl: 'recipe-lib/new-recipe/new-recipe.html',
		controller: 'NewRecipeCtrl'
	});
}])

.controller('NewRecipeCtrl', function ($scope, $location, userService, recipeService) {

	$scope.newRecipeName = '';
	$scope.newRecipeContent = '';
	$scope.newImage = null;

	var attemptedToSaveWithNoLogin = false;

	$scope.saveRecipeAndNavigate = function () {
		if (isNotLoggedIn()) {
			attemptedToSaveWithNoLogin = true;
			return;
		} else {
			saveRecipe()
			.then(function (recipe) {
				$location.path('/view-recipe/' + recipe.recipeId);
			});
		}
	};

	$scope.shouldShowErrorMessage = function () {
		return attemptedToSaveWithNoLogin && isNotLoggedIn();
	};

	$scope.imageSaved = function(image) {
		$scope.newImage = image;
	};

	function isNotLoggedIn() {
		return !userService.isLoggedIn();
	}

	function saveRecipe() {
		var recipeToSave = {
			recipeName: $scope.newRecipeName,
			recipeContent: $scope.newRecipeContent,
			image: $scope.newImage
		};

		return recipeService.saveRecipe(recipeToSave);
	}
});