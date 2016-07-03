'use strict';

angular.module('recipe.viewRecipe', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/view-recipe/:recipeId', {
		templateUrl: 'view-recipe/view-recipe.html',
		controller: 'ViewRecipeCtrl'
	});
}])

.controller('ViewRecipeCtrl', function($scope, $http, $routeParams, $location, routeHistory) {

	var inEditMode = false;
	$scope.recipe = {};
	$scope.nameBeingEdited = '';
	$scope.contentBeingEdited = '';
	
	$http.get('api/recipe/' + $routeParams.recipeId)
		.success(function(recipe) {
			$scope.recipe = recipe;
		})
		.error(function(error) {
			console.log('error retrieving recipe: ', error);
		});

	$scope.shouldShowEditButtons = function() {
		return $scope.recipe.editable;
	};

	$scope.inEditMode = function() {
		return inEditMode;
	};

	$scope.editClicked = function() {
		$scope.nameBeingEdited = $scope.recipe.recipeName;
		$scope.contentBeingEdited = $scope.recipe.recipeContent;
		inEditMode = true;
	};

	$scope.saveClicked = function() {
		var recipeToPut = {
			recipeId: $scope.recipe.recipeId,
			recipeName: $scope.nameBeingEdited,
			recipeContent: $scope.contentBeingEdited
		};

		$http.put('/api/recipe/' + $scope.recipe.recipeId, recipeToPut)
			.success(function (recipe) {
				$scope.recipe = recipe;
			})
			.error(function (error) {
				console.log('failure saving recipe:', error);
			});
		inEditMode = false;
	};

	$scope.back = function() {
		var lastPath = routeHistory.getLastRoute();
		$location.url(lastPath);
	};

	$scope.shouldShowBackButton = function() {
		return routeHistory.getLastRoute() !== undefined;
	};
});