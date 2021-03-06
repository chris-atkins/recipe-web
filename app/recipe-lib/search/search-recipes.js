'use strict';

angular.module('recipe')

.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/search-recipes', {
		templateUrl: 'recipe-lib/search/search-recipes.html',
		controller: 'SearchRecipesCtrl'
	});
}])

.controller('SearchRecipesCtrl', function ($scope, $http, $routeParams, $location, userService, recipeBookService, recipeService) {

	$scope.recipeList = [];
	$scope.searchString = '';
	$scope.searchHasOccurred = false;
	$scope.usersRecipeBook = [];

	initializePage();

	function initializePage() {
		var queryParamSearchString = $routeParams.searchFor;

		if (!queryParamSearchString || queryParamSearchString == 'all') {
			$scope.searchString = '';
			performSearchAndDisplayResults();
		} else {
			$scope.searchString = queryParamSearchString;
			performSearchAndDisplayResults(queryParamSearchString);
		}

		retrieveUserRecipeBook();
	}

	function retrieveUserRecipeBook() {
		//TODO - can this be in the user service - let that service get the recipe book when a user is logged in - then just ask the service from here
		recipeBookService.getRecipeBook()
		.then(function (recipeBook) {
			$scope.usersRecipeBook = recipeBook;
		})
		.catch(function(error) {
			console.log('Error getting recipe book:', error);
		});
	}

	$scope.searchRecipes = function () {
		$location.url('/search-recipes?searchFor=' + $scope.searchString);
	};

	$scope.showAllRecipes = function () {
		$location.url('/search-recipes?searchFor=all');
	};

	function performSearchAndDisplayResults(searchString) {
		recipeService.searchRecipes(searchString)
		.then(function (data) {
			$scope.recipeList = data;
			$scope.searchHasOccurred = true;
			$scope.resultInfoMessage = searchString === undefined ? 'Showing all recipes' : 'Showing recipes that match "' + searchString + '"';
		})
		.catch(function (error) {
			console.log('Error getting recipes:', error);
		});
	}
})

.directive('focus', function ($timeout) {
	return {
		scope: {
			trigger: '@focus'
		},
		link: function (scope, element) {
			scope.$watch('trigger', function (value) {
				if (value === "true") {
					$timeout(function () {
						element[0].focus();
					});
				}
			});
		}
	};
});