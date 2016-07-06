'use strict';

angular.module('recipe.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/home', {
		templateUrl: 'home/home.html',
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
		console.log('going to: ', recipeBookUrl);
		$location.url(recipeBookUrl);
	};

	$scope.shouldShowErrorMessage = function() {
		return userHasClickedRecipeBook && !userService.isLoggedIn();
	};
});