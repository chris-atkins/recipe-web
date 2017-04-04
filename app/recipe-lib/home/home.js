'use strict';

angular.module('recipe')

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/home', {
		templateUrl: 'recipe-lib/home/home.html',
		controller: 'HomeCtrl'
	});
}])

.controller('HomeCtrl', function($scope, $location, userService) {

	var userHasClickedLoginSensitiveButton = false;

	$scope.navigateToRecipeBook = function() {
		userHasClickedLoginSensitiveButton = true;
		if (!userService.isLoggedIn()) {
			return;
		}
		
		var currentUser = userService.getLoggedInUser();
		var recipeBookUrl = '/user/' + currentUser.userId + '/recipe-book';
		$location.url(recipeBookUrl);
	};

	$scope.hideErrorMessage = function() {
		userHasClickedLoginSensitiveButton = false;
	};

	$scope.shouldShowErrorMessage = function() {
		return userHasClickedLoginSensitiveButton && !userService.isLoggedIn();
	};

	$scope.navigateToBrowseRecipes = function() {
		$location.url('/search-recipes');
	};

	$scope.navigateToSaveNewRecipe = function() {
		userHasClickedLoginSensitiveButton = true;
		if (!userService.isLoggedIn()) {
			return;
		}

		$location.url('/new-recipe');
	};
});
