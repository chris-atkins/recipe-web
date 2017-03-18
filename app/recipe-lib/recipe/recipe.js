'use strict';

angular.module('recipe')

.directive('recipeElement', function () {
	return {
		replace: false,
		restrict: 'A',
		templateUrl: 'recipe-lib/recipe/recipe.html',
		controller: 'recipeCtrl',
		scope: {
			recipe: '=',
			recipeBook: '=',
			recipeBookMode: '@',
			owningUserId: '@',
			recipeRemovalCallback: '='
		}
	}
})

.controller('recipeCtrl', function ($scope, $location, recipeBookService, userService, _) {

	//$scope.recipe: '=',
	//$scope.recipeBook: '=',
	//$scope.recipeBookMode: '@',
	//$scope.owningUserId: '@',
	//$scope.recipeRemovalCallback: '='

	$scope.recipeInRecipeBook = false;
	$scope.canAddToRecipeBook = false;
	$scope.bookMode = $scope.recipeBookMode === 'true';

	updateRecipeBookFlags();

	$scope.removeAllowed = function () {
		var loggedInUserId = userService.getLoggedInUser().userId;
		return loggedInUserId === $scope.owningUserId;
	};

	$scope.removeRecipe = function($event, recipe) {
		$event.stopImmediatePropagation();
		$scope.recipeRemovalCallback(recipe);
	};

	$scope.$watch('recipeBook', function(newValue) {
		$scope.recipeBook = newValue;
		updateRecipeBookFlags();
	});

	function updateRecipeBookFlags() {
		if ($scope.bookMode) {
			return;
		}

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

	$scope.addToRecipeBook = function($event) {
		$event.stopImmediatePropagation();

		recipeBookService.addToRecipeBook($scope.recipe.recipeId)
		.then(function(recipeBook) {
			$scope.recipeBook = recipeBook;
		});
	};

	$scope.navigateToRecipePage = function (recipe) {
		$location.url('/view-recipe/' + recipe.recipeId);
	};
});
