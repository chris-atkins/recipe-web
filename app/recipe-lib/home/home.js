'use strict';

angular.module('recipe')

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/home', {
		templateUrl: 'recipe-lib/home/home.html',
		controller: 'HomeCtrl'
	});
}])

.controller('HomeCtrl', function($scope, $location, userService) {

	var userHasClickedRecipeBook = false;

	$scope.navigateToRecipeBook = function() {
		userHasClickedRecipeBook = true;
		if (!userService.isLoggedIn()) {
			return;
		}
		
		var currentUser = userService.getLoggedInUser();
		var recipeBookUrl = '/user/' + currentUser.userId + '/recipe-book';
		$location.url(recipeBookUrl);
	};

	$scope.shouldShowErrorMessage = function() {
		return userHasClickedRecipeBook && !userService.isLoggedIn();
	};

	$scope.navigateToBrowseRecipes = function() {
		$location.url('/search-recipes');
	};

	$scope.navigateToSaveNewRecipe = function() {
		$location.url('/new-recipe');
	};
});
