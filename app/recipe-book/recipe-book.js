'use strict';

angular.module('recipe.recipeBook', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/user/:userId/recipe-book', {
		templateUrl: 'recipe-book/recipe-book.html',
		controller: 'RecipeBookCtrl'
	});
}])

.controller('RecipeBookCtrl', function ($scope, $routeParams, $http, recipeBookService, userService) {

	$scope.user = {};
	$scope.recipeList = [];

	getRecipeBookOwningUser();
	getRecipeBook();

	function getRecipeBookOwningUser() {
		//TODO - check logged in user, if they are the same, don't make this WS call
		var userId = $routeParams.userId;
		$http.get('api/user/' + userId)
		.success(function (user) {
			$scope.user = user;
		})
		.error(function (error) {
			console.log('error retrieving user: ', error);
		});
	}

	function getRecipeBook() {
		var userId = $routeParams.userId;
		$http.get('api/recipe?recipeBook=' + userId)
		.success(function(recipeList) {
			$scope.recipeList = recipeList;
		})
		.catch(function (error) {
			console.log('error retrieving recipe book	: ', error);
		});
	}

	$scope.removeRecipeFromBook = function (recipe) {
		recipeBookService.removeRecipeFromBook(recipe.recipeId)
		.then(function () {
			getRecipeBook();
		});
	};

	$scope.actionsAllowed = function () {
		var bookOwnerId = $routeParams.userId;
		var loggedInUserId = userService.getLoggedInUser().userId;

		return loggedInUserId === bookOwnerId;
	};

	$scope.actionsNotAllowed = function () {
		return !$scope.actionsAllowed();
	};
});