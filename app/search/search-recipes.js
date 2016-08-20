'use strict';

angular.module('recipe.searchRecipes', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/search-recipes', {
		templateUrl: 'search/search-recipes.html', 
		controller: 'SearchRecipesCtrl'
	});
}])

.controller('SearchRecipesCtrl', function($scope, $http, $routeParams, $location, userService, _) {
	
	$scope.recipeList = [];
	$scope.searchString = '';
	$scope.searchHasOccurred = false;
	$scope.usersRecipeBook = [];

	initializePage();

	function initializePage() {
		var queryParamSearchString = $routeParams.searchFor;

		if (queryParamSearchString) {
			if(queryParamSearchString == 'all') {
				$scope.searchString = '';
				performSearchAndDisplayResults();
			} else {
				$scope.searchString = queryParamSearchString;
				performSearchAndDisplayResults(queryParamSearchString);
			}
		}

		retrieveUserRecipeBook();
	}

	function retrieveUserRecipeBook() {
		//TODO - can this be in the user service - let that service get the recipe book when a user is logged in - then just ask the service from here
		var userId = userService.getLoggedInUser().userId;

		$http.get('/api/user/' + userId + '/recipe-book')
		.success(function(recipeBook) {
			$scope.usersRecipeBook = recipeBook;
		})
		.error(function(error) {
			console.log('Error getting recipe book:', error);
		});
	}

	$scope.searchRecipes = function() {
		$location.url('/search-recipes?searchFor=' + $scope.searchString);
	};

	$scope.showAllRecipes = function() {
		$location.url('/search-recipes?searchFor=all');
	};

	function performSearchAndDisplayResults(searchString){
		var queryParams = searchString ? '?searchString=' + searchString : '';
		$http.get('/api/recipe' + queryParams)
			.success(function(data) {
				$scope.recipeList = data;
				$scope.searchHasOccurred = true;
				$scope.resultInfoMessage = searchString === undefined ? 'Showing all recipes' :'Showing recipes that match "' + searchString + '"'
			})
			.error(function(error) {
				console.log('Error getting recipes:', error);
			});
	}

	$scope.canBeAddedToRecipeBook = function(recipe) {
		return !$scope.alreadyInRecipeBook(recipe);
	};

	$scope.alreadyInRecipeBook = function(recipe) {
		var recipeId = recipe.recipeId;
		return _.any($scope.usersRecipeBook, function(value) {
			return recipeId === value.recipeId;
		});
	};

	$scope.addToRecipeBook = function(recipe) {
		var userId = userService.getLoggedInUser().userId;
		var url = '/api/user/' + userId + '/recipe-book';
		$http.post(url, {recipeId: recipe.recipeId})
		.success(function() {
			retrieveUserRecipeBook();
		})
		.error(function(error) {
			console.log('Error adding recipe to recipe book:', error);
		});
	};
})

.directive('focus', function($timeout) {
	return {
		scope : {
			trigger : '@focus'
		},
		link : function(scope, element) {
			scope.$watch('trigger', function(value) {
				if (value === "true") {
					$timeout(function() {
						element[0].focus();
					});
				}
			});
		}
	};
});