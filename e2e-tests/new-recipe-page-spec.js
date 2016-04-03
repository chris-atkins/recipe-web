'use strict';
var pageUtils = require('./page-utils');
var dataUtils = require('./data-utils');

describe('the new recipe page', function() {
	
	describe('content', function() {

		beforeAll(function() {
			browser.get('/#/new-recipe');
		});
		
		it('has a title', function() {
			var pageTitle = element(by.id('new-recipe-page-title'));
			expect(pageTitle.getText()).toBe('Save a New Recipe');
		});
		
		it('has an input to enter the recipe name', function() {
			var recipeNameInput = element(by.css('input#recipe-name-input'));
			expect(recipeNameInput.isPresent()).toBe(true);
			expect(recipeNameInput.getAttribute('placeholder')).toBe('Recipe Name');
		});
		
		it('has text area to enter the recipe content', function() {
			var recipeContentInput = element(by.css('textarea#recipe-content-input'));
			expect(recipeContentInput.isPresent()).toBe(true);
			expect(recipeContentInput.getAttribute('placeholder')).toBe('Recipe Content');
		});
		
		it('has a save button', function() {
			var saveButton = element(by.id('save-button'));
			expect(saveButton.getText()).toBe('Save Recipe');
		});
		
		it('has a home button that navigates back to the home page', function() {
			var homeButton = element(by.id('home-button'));
			expect(homeButton.getText()).toBe('Home');
			homeButton.click();
			expect(browser.getLocationAbsUrl()).toMatch('/home');
		});
	});
	
	describe('the save button', function() {

		var newRecipeName = 'the best test recipe name ever';
		var newRecipeContent = 'belIEVE me';

		var recipeNameInput = element(by.css('input#recipe-name-input'));
		var recipeContentInput = element(by.css('textarea#recipe-content-input'));
		var saveButton = element(by.id('save-button'));
		
		var allRecipesOnBrowsePage = element.all(by.className('recipe'));
		
		beforeEach(function() {
			browser.get('/#/new-recipe');
		});
		
		afterAll(function(done) {
			dataUtils.removeAllRecipeData(done);
		});
		
		it('takes the user back to the home page', function() {
			recipeNameInput.sendKeys('test name');
			recipeContentInput.sendKeys('test content');
			
			saveButton.click();
			expect(browser.getLocationAbsUrl()).toMatch('/home');
		});
		
		it('saves whatever was entered in the input fields as a new recipe that can now be navigated to', function() {
			recipeNameInput.sendKeys(newRecipeName);
			recipeContentInput.sendKeys(newRecipeContent);
			saveButton.click();
			
			browser.get('/#/browse-all-recipes');
			var savedRecipeLink = pageUtils.findRecipeWithName(newRecipeName, allRecipesOnBrowsePage).element(by.css('a'));
			savedRecipeLink.click();
			
			expect(element(by.id('recipe-name')).getText()).toBe(newRecipeName);
			expect(element(by.id('recipe-content')).getText()).toBe(newRecipeContent);
		});
	});
});