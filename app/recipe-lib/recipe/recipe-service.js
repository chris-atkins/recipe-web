'use strict';

angular.module('recipe')

.factory('recipeService', function ($http) {

	var findRecipe = function(recipeId) {
		return $http.get('/api/recipe/' + recipeId)
		.then(function(response) {
			return response.data;
		});
	};

	var saveRecipe = function (recipeToSave) {
		return $http.post('/api/recipe', recipeToSave)
		.then(function (response) {
			return response.data;
		});
	};

	var searchRecipes = function (searchString) {
		var queryParams = searchString ? '?searchString=' + searchString : '';

		return $http.get('/api/recipe' + queryParams)
		.then(function(response) {
			return response.data;
		});
	};

	var allRecipesInUserBook = function(userId) {
		return $http.get('/api/recipe?recipeBook=' + userId)
			.then(function(response){
				return response.data;
			});
	};

	return {
		findRecipe: findRecipe,
		saveRecipe: saveRecipe,
		searchRecipes: searchRecipes,
		allRecipesInUserBook: allRecipesInUserBook
	};
});