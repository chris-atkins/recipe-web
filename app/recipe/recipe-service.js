'use strict';

angular.module('recipe.recipe.service', [])

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

	return {
		saveRecipe: saveRecipe
	};
});