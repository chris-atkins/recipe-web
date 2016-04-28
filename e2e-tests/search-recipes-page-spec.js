'use strict';
var dataUtils = require('./data-utils');
var pageUtils = require('./page-utils');

describe('the search recipes page', function() {

	  var searchInput = element(by.id('search-input'));
	  var searchButton = element(by.id('search-button'));
	
	  var recipe1 = {
			  recipeName: 'First Recipe Name',
			  recipeContent: 'First Recipe Content findMe'
	  };
	  var recipe2 = {
			  recipeName: 'Second Recipe Name findMe',
			  recipeContent: 'Second Recipe Content'
	  };
	  var recipe3 = {
			  recipeName: 'Third Recipe Name',
			  recipeContent: 'Third Recipe Content'
	  }
	
	describe('content', function() {
		
		beforeAll(function() {
			browser.get('/#/search-recipes');
		});
		
		it('has a title', function() {
			var homeButton = element(by.id('search-recipes-page-title'));
			expect(homeButton.getText()).toBe('Search Recipes');
		});
		
		it('has a search input field', function() {
			var searchInput = element(by.css('input#search-input'));
			expect(searchInput.isPresent()).toBe(true);
			expect(searchInput.getAttribute('placeholder')).toBe('Search for...');
		});
		
		it('has a search button', function() {
			var searchButton = element(by.css('button#search-button'));
			expect(searchButton.getText()).toBe('Search Recipes');
		});
		
		it('has a home button', function() {
			var homeButton = element(by.id('home-button'));
			expect(homeButton.getText()).toBe('Home');
		});
		
		it('no table (of recipes) is shown on the page when first navigated to', function() {
			var recipeTable = element(by.css('table'));
			expect(recipeTable.isDisplayed()).toBe(false);
		});
	});
	
	describe('the search function', function() {
		
		beforeAll(function(done) {
			dataUtils.addRecipes([recipe1, recipe2, recipe3]).then(done);
		});
		  
		afterAll(function(done) {
			dataUtils.cleanupData(done);
		});
		  
		beforeEach(function() {
			browser.get("/#search-recipes");
		});
		
		it('the page starts with the search input having focus', function() {
			expect(browser.driver.switchTo().activeElement().getAttribute('id')).toBe('search-input');
		});
		
		it('searches for recipes when the search button is pressed', function() {
			searchInput.sendKeys('findMe');
			searchButton.click();
			
			expect(element.all(by.className('recipe')).count()).toBe(2);
		});
		
		it('found recipes have a name and view button', function() {
			searchInput.sendKeys('findMe');
			searchButton.click();
			
			var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', element.all(by.className('recipe')));
			
			var recipeName = firstRecipe.element(by.className('recipe-name'));
			expect(recipeName.getText()).toBe('First Recipe Name');
			
			var viewRecipeLink = firstRecipe.element(by.css('a.view-recipe-link'));
			expect(viewRecipeLink.getText()).toBe('View');
		});
		
		it('searches for recipes when enter is typed in the input field', function() {
				
		});
		
		it('a search results page can be navigated to with a url (ex: with a bookmark)', function() {
			
		});
		
		it('gives a message when no recipes are found', function() {
			var noSearchResultsMessage = element(by.id('no-search-results-message'));
			expect(noSearchResultsMessage.isDisplayed()).toBe(false);
			
			searchInput.sendKeys('willNeverFindMe');
			searchButton.click();
			
			expect(noSearchResultsMessage.getText()).toBe('No recipes were found that match the search.');
		});
	});
	
	describe('navigation', function() {

		beforeAll(function(done) {
			dataUtils.addRecipes([recipe1, recipe2, recipe3]).then(done);
		});
		  
		afterAll(function(done) {
			dataUtils.cleanupData(done);
		});
		  
		beforeEach(function() {
			browser.get("/#search-recipes");
		});
		
		it('the home button navigates to the home page', function() {
			var homeButton = element(by.id('home-button'));
			homeButton.click();
			expect(browser.getLocationAbsUrl()).toMatch('/home');
		});
		
		it('for each recipe after searching, has view recipe buttons that navigate to the individual recipes', function() {
			searchInput.sendKeys('findMe');
			searchButton.click();
			
			var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', element.all(by.className('recipe')));
			var recipeLink = firstRecipe.element(by.css('a.view-recipe-link'));
			
			firstRecipe.getAttribute('id').then(function(recipeId) {
			
				recipeLink.click();
				expect(browser.getLocationAbsUrl()).toMatch('/view-recipe/' + recipeId);
			});
		});
	});
});