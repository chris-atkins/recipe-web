'use strict';

angular.module('recipe')

.controller('recipeCtrl', function ($scope, $location, recipeBookService, userService, _) {

	$scope.recipe = $scope.item;
	$scope.recipeBook = $scope.book;
	$scope.recipeInRecipeBook = false;
	$scope.canAddToRecipeBook = false;

	updateRecipeBookFlags();

	function updateRecipeBookFlags() {
		var inRecipeBook = isRecipeInBook();
		if (inRecipeBook) {
			$scope.recipeInRecipeBook = true;
			$scope.canAddToRecipeBook = false;
		} else {
			$scope.recipeInRecipeBook = false;
			$scope.canAddToRecipeBook = true;
		}
	}

	function isRecipeInBook() {
		if ($scope.recipe === undefined || $scope.recipeBook === undefined) {
			return false;
		}
		var foundRecipe = _.findWhere($scope.recipeBook, {recipeId: $scope.recipe.recipeId});
		return foundRecipe !== undefined;
	}

	$scope.navigateToRecipePage = function () {
		$location.url('/view-recipe/' + $scope.recipe.recipeId);
	};

	$scope.addToRecipeBook = function($event) {
		$event.stopImmediatePropagation();

		recipeBookService.addToRecipeBook($scope.recipe.recipeId)
		.then(function(recipeBook) {
			$scope.recipeBook = recipeBook;
			updateRecipeBookFlags();
		});
	}
})

.directive('recipe', function () {
	return {
		replace: false,
		restrict: 'A',
		templateUrl: 'recipe-lib/recipe/recipe.html',
		controller: 'recipeCtrl',
		scope: {
			item: '=',
			book: '='
		}
	}
});
