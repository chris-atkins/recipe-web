'use strict';

function findRecipeWithName(recipeName, recipeElements) {
	var matchingRecipes = recipeElements.filter(function(item) {
		return item.element(by.className('recipe-name')).getText().then(function(recipeNameText) {
			return (recipeNameText === recipeName);
		});
	});
	expect(matchingRecipes.count()).toBe(1);
	return matchingRecipes.first();	
}

module.exports = {
	findRecipeWithName: findRecipeWithName
};