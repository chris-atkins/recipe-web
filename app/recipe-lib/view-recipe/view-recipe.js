'use strict';

angular.module('recipe.viewRecipe', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/view-recipe/:recipeId', {
		templateUrl: 'recipe-lib/view-recipe/view-recipe.html',
		controller: 'ViewRecipeCtrl'
	});
}])

.controller('ViewRecipeCtrl', function($scope, $http, $routeParams, $location, routeHistory, recipeBookService, userService, _) {

	var inEditMode = false;
	var userRecipeBook = [];

	$scope.recipe = {};
	$scope.nameBeingEdited = '';
	$scope.contentBeingEdited = '';


	initialize();

	function initialize() {
		$http.get('api/recipe/' + $routeParams.recipeId)
		.success(function (recipe) {
			$scope.recipe = recipe;
		})
		.error(function (error) {
			console.log('error retrieving recipe: ', error);
		});

		recipeBookService.getRecipeBook()
		.then(function(recipeBook) {
			userRecipeBook = recipeBook;
		});
	}

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

	$scope.cancelEdit = function() {
		inEditMode = false;
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

	$scope.inRecipeBook = function() {
		var recipeId = $scope.recipe.recipeId;
		return _.any(userRecipeBook, function(value) {
			return recipeId === value.recipeId;
		});
	};

	$scope.canAddToRecipeBook = function() {
		return userService.isLoggedIn() && !$scope.inRecipeBook();
	};

	$scope.addToRecipeBook = function() {
		recipeBookService.addToRecipeBook($scope.recipe.recipeId)
		.then(function(recipeBook) {
			userRecipeBook = recipeBook;
		});
	};

	$scope.removeRecipeFromBook = function() {
		recipeBookService.removeRecipeFromBook($scope.recipe.recipeId)
		.then(function(recipeBook) {
			userRecipeBook = recipeBook;
		});
	};
});