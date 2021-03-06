'use strict';

angular.module('recipe')

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/view-recipe/:recipeId', {
		templateUrl: 'recipe-lib/view-recipe/view-recipe.html',
		controller: 'ViewRecipeCtrl'
	});
}])

.controller('ViewRecipeCtrl', function($scope, $http, $routeParams, $location, routeHistory, recipeBookService, userService, _, $sce, clipboard) {

	var inEditMode = false;
	var userRecipeBook = [];
	var shouldShowImageUpload = false;

	$scope.recipe = {};
	$scope.initialContent = '';
	$scope.nameBeingEdited = '';
	$scope.contentBeingEdited = '';

	initialize();

	function initialize() {
		$http.get('api/recipe/' + $routeParams.recipeId)
		.success(function (recipe) {
			recipeRetrieved(recipe);
		})
		.error(function (error) {
			console.log('error retrieving recipe: ', error);
		});

		recipeBookService.getRecipeBook()
		.then(function(recipeBook) {
			userRecipeBook = recipeBook;
		});
	}

	function recipeRetrieved(recipe) {
		$scope.recipe = recipe;
		$scope.initialContent = $scope.recipe.recipeContent;
		$scope.recipe.recipeContent = $sce.trustAsHtml($scope.recipe.recipeContent);
	}

	$scope.imageSaved = function(image) {
		$scope.recipe.image = image;
	};

	$scope.shouldShowEditButtons = function() {
		return $scope.recipe.editable;
	};

	$scope.inEditMode = function() {
		return inEditMode;
	};

	$scope.shouldShowImageUpload = function() {
		return shouldShowImageUpload;
	};

	$scope.toggleUploadImage = function() {
		shouldShowImageUpload = !shouldShowImageUpload;
	};

	$scope.editClicked = function() {
		$scope.nameBeingEdited = $scope.recipe.recipeName;
		$scope.contentBeingEdited = String($scope.recipe.recipeContent);
		inEditMode = true;
	};

	$scope.cancelEdit = function() {
		inEditMode = false;
	};

	$scope.saveClicked = function() {
		var recipeContent = typeof($scope.contentBeingEdited) === 'object' ? $scope.initialContent: $scope.contentBeingEdited;
		var recipeToPut = {
			recipeId: $scope.recipe.recipeId,
			recipeName: $scope.nameBeingEdited,
			recipeContent: recipeContent,
			image: $scope.recipe.image
		};

		$http.put('/api/recipe/' + $scope.recipe.recipeId, recipeToPut)
			.success(function (recipe) {
				recipeRetrieved(recipe);
			})
			.error(function (error) {
				console.log('failure saving recipe:', error);
			});
		inEditMode = false;
	};

	$scope.inRecipeBook = function() {
		var recipeId = $scope.recipe.recipeId;
		return _.any(userRecipeBook, function(value) {
			return recipeId === value.recipeId;
		});
	};

	$scope.canAddToRecipeBook = function() {
		return userService.isLoggedIn() && !$scope.inRecipeBook() && !inEditMode;
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

	$scope.canRemoveFromRecipeBook = function() {
		return !inEditMode && $scope.inRecipeBook();
	};

	$scope.imageExists = function(recipe) {
		if (recipe.image) {
			if (recipe.image.imageUrl) {
				return true;
			}
		}
		return false;
	};

	$scope.copyAlternateUrlClicked = function() {
		var protocol = $location.protocol();
		var host = $location.host();
		var url = protocol + '://' + host + '/recipe/' + $scope.recipe.recipeId;

		clipboard.copyText(url);
	};
});