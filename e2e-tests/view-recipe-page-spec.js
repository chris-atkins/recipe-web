'use strict';
var dataUtils = require('./data-utils');
var pageUtils = require('./page-utils');

describe('the vew recipe page', function() {
	
	var recipeName = 'Recipe Being Tested - Name';
	var recipeContent = 'Recipe Being Tested - Content';
	var recipeId;
	var email;
	var userId;
	
	beforeAll(function(done) {
		email = dataUtils.randomEmail();
		var user = {userName: 'ohai', userEmail: email};
		var recipeToAdd = {recipeName: recipeName, recipeContent: recipeContent};
		
		dataUtils.postUser(user)
		.then(function(postedUser) {
			userId = postedUser.userId;
			return dataUtils.addRecipe(recipeToAdd, userId);
		})
		.then(function(recipe) {
			recipeId = recipe.recipeId;
			return pageUtils.login(email);
		}).then(done);
	});
	
	afterAll(function(done) {
		pageUtils.logout();
		dataUtils.cleanupData(done);
	});
	
	describe('content', function() {
		
		beforeAll(function() {
			browser.get('/#/view-recipe/' + recipeId);
		});
		
		it('shows a user section', function() {
			var userSection = element(by.className('user-section'));
			expect(userSection.isPresent()).toBe(true);
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
	
	describe('handles multi-line content', function() {
		var multilineRecipeId;
		var multilineContent = 'First Line\nSecond Line';
		
		beforeAll(function(done) {
			var recipeToAdd = {recipeName: recipeName, recipeContent: multilineContent};
			dataUtils.addRecipe(recipeToAdd, userId).then(function(recipe) {
				multilineRecipeId = recipe.recipeId;
			}).then(done);
		});
		
		it('shows the content on separate lines', function() {
			browser.get('/#/view-recipe/' + multilineRecipeId);
			var recipeContentElement = element(by.id('recipe-content'));
			
			expect(recipeContentElement.getInnerHtml()).toBe('First Line<br>Second Line');
			expect(recipeContentElement.getText()).toBe('First Line\nSecond Line');
		});
	});
	
	describe('navigation', function() {
		
		beforeEach(function() {
			browser.get('/#/view-recipe/' + recipeId);
		});
		
		it('has a home button that navigates to the home page', function() {
			var homeButton = element(by.id('home-button'));
			expect(homeButton.getText()).toBe('Home');
			homeButton.click();
			expect(browser.getLocationAbsUrl()).toMatch('/home');
		});
	});
	
});