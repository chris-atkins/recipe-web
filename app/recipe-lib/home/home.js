'use strict';

angular.module('recipe')

.config(['$routeProvider', function($routeProvider) {
	// Angular handles /home - AngularJS renders empty template in ng-view
	$routeProvider.when('/home', {
		template: ''
	});

	$routeProvider.when('/home-legacy', {
		templateUrl: 'recipe-lib/home/home.html',
		controller: 'HomeCtrl'
	});
}])

.controller('HomeCtrl', ['$scope', '$location', 'userService', function($scope, $location, userService) {

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
}]);
