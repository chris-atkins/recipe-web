'use strict';

angular.module('recipe.recipe.service', [])

.factory('recipeService', function ($http, $q) {

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
		var recipesPromise = $q.defer();
		var queryParams = searchString ? '?searchString=' + searchString : '';
		$http.get('/api/recipe' + queryParams)
		.success(function(recipes) {
			recipesPromise.resolve(recipes);
		})
		.error(function(error) {
			recipesPromise.reject(error);
		});
		return recipesPromise.promise;
	};

	return {
		saveRecipe: saveRecipe,
		searchRecipes: searchRecipes
	};
});