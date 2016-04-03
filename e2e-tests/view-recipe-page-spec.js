'use strict';
var dataUtils = require('./data-utils');

describe('the vew recipe page', function() {
	
	var recipeName = 'Recipe Being Tested - Name';
	var recipeContent = 'Recipe Being Tested - Content';
	var recipeId;
	
	beforeAll(function(done) {
		var recipeToAdd = {recipeName: recipeName, recipeContent: recipeContent};
		dataUtils.addRecipe(recipeToAdd).then(function(recipe) {
			recipeId = recipe.recipeId;
		}).then(done);
	});
	
	afterAll(function(done) {
		dataUtils.cleanupData(done);
	});
	
	describe('content', function() {
		
		beforeAll(function() {
			browser.get('/#/view-recipe/' + recipeId);
		});
		
		it('shows the recipe name', function() {
			var recipeNameElement = element(by.id('recipe-name'));
			expect(recipeNameElement.getText()).toBe(recipeName);
		});
		
		it('shows the recipe content', function() {
			var recipeContentElement = element(by.id('recipe-content'));
			expect(recipeContentElement.getText()).toBe(recipeContent);
		});		
	});
	
	describe('navigation', function() {
		
		beforeEach(function() {
			browser.get('/#/view-recipe/' + recipeId);
		})
		
		it('has a home button that navigates to the home page', function() {
			var homeButton = element(by.id('home-button'));
			expect(homeButton.getText()).toBe('Home');
			homeButton.click();
			expect(browser.getLocationAbsUrl()).toMatch('/home');
		});
	});
	
});