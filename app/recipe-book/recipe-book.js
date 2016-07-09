'use strict';

angular.module('recipe.recipeBook', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/user/:userId/recipe-book', {
		templateUrl: 'recipe-book/recipe-book.html',
		controller: 'RecipeBookCtrl'
	});
}])

.controller('RecipeBookCtrl', function($scope, $routeParams, $http) {

	$scope.user = {};
	$scope.recipeList = [];
	
	getUser();
	getRecipeBook();
	
	function getUser() {
		//TODO - check logged in user, if they are the same, don't make this WS call
		var userId = $routeParams.userId;
		$http.get('api/user/' + userId)
			.success(function(user) {
				$scope.user = user;
			})
			.error(function(error) {
				console.log('error retrieving user: ', error);
			});
	}

	function getRecipeBook() {
		var userId = $routeParams.userId;
		$http.get('api/recipe?recipeBook=' + userId)
		.success(function(recipeList) {
			$scope.recipeList = recipeList;
		})
		.error(function(error) {
			console.log('error retrieving recipe book	: ', error);
		});
	}
});