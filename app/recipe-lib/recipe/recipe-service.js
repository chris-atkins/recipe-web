'use strict';

angular.module('recipe')

.factory('recipeService', function ($http) {

	var saveRecipe = function (recipeToSave) {
		return $http.post('/api/recipe', recipeToSave)
		.success(function (recipe) {
			return recipe;
		})
		.error(function (error) {
			console.log('failure saving recipe:', error);
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
		saveRecipe: saveRecipe,
		searchRecipes: searchRecipes,
		allRecipesInUserBook: allRecipesInUserBook
	};
});