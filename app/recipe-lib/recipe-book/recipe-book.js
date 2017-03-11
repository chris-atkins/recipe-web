'use strict';

angular.module('recipe')

.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/user/:userId/recipe-book', {
		templateUrl: 'recipe-lib/recipe-book/recipe-book.html',
		controller: 'RecipeBookCtrl'
	});
}])

.controller('RecipeBookCtrl', function ($scope, $routeParams, $http, recipeBookService, userService, recipeService, $location) {

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
		recipeService.allRecipesInUserBook(userId)
		.then(function(recipeList) {
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

	$scope.navigateHome = function() {
		$location.url('/home');
	};

	$scope.navigateToRecipe = function(recipeId){
		$location.url('/view-recipe/'+ recipeId);
	}
});