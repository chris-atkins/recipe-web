'use strict';
var dataUtils = require('./utils/data-utils');
var pageUtils = require('./utils/page-utils');
var searchPage = require('./page-objects/search-page');

describe('the search recipes page', function() {

	var searchInput = searchPage.searchInput;
	var searchButton = searchPage.searchButton;
	var pageTitle = searchPage.pageTitle;
	var userSection = searchPage.userSection;
	var showAllRecipesButton = searchPage.showAllRecipesButton;
	var homeButton = searchPage.homeButton;
	var recipeListHolder = searchPage.recipeListHolder;
	var recipeList = searchPage.recipeList;
	var resultInfoMessage = searchPage.resultInfoMessage;
	var noSearchResultsMessage = searchPage.noSearchResultsMessage;
	var backButton = searchPage.backButton;
	var findRecipeLink = searchPage.findRecipeLink;
		
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
	};
	
	var email;
	var userId;
		
	beforeAll(function(done) {
		  email = dataUtils.randomEmail();
		  var user = {userName: 'ohai', userEmail: email};
			
		  dataUtils.postUser(user)
		  .then(function(user) {
			  userId = user.userId;
			  return dataUtils.addRecipes([recipe1, recipe2, recipe3], user.userId);
		  })
		  .then(function() {
			  return pageUtils.login(email);
		  })
		  .then(done);
	});
	  
	afterAll(function(done) {
		pageUtils.logout();
		dataUtils.cleanupData(done);
	});
	  
	describe('content', function() {
		
		beforeAll(function() {
			browser.get('/#/search-recipes');
		});
		
		it('has a user section', function() {
			expect(userSection.isPresent()).toBe(true);
		});
		
		it('has a title', function() {
			expect(pageTitle.getText()).toBe('Search Recipes');
		});
		
		it('has a search input field', function() {
			expect(searchInput.isPresent()).toBe(true);
			expect(searchInput.getAttribute('placeholder')).toBe('Search for...');
		});
		
		it('has a search button', function() {
			expect(searchButton.getText()).toBe('Search Recipes');
		});

		it('has a show all recipes button', function() {
			expect(showAllRecipesButton.getText()).toBe('Show All Recipes');
		});
		
		it('all recipes are shown on the page when first navigated to', function() {
			expect(recipeListHolder.isDisplayed()).toBe(true);
			expect(recipeList.count()).toBe(3);
		});
	});
	
	describe('the search function', function() {
		  
		beforeEach(function() {
			browser.get("/#/search-recipes");
			browser.waitForAngular();
		});
		
		it('the page starts with the search input having focus', function() {
			expect(browser.driver.switchTo().activeElement().getAttribute('id')).toBe('search-input');
		});
		
		it('searches for recipes when the search button is pressed, and displays info on what results are being shown', function() {
			searchInput.sendKeys('findMe');
			searchButton.click();

			expect(recipeList.count()).toBe(2);
			expect(resultInfoMessage.isDisplayed()).toBe(true);
			expect(resultInfoMessage.getText()).toBe('Showing recipes that match "findMe"');
		});
		
		it('found recipes have a name', function() {
			searchInput.sendKeys('findMe');
			searchButton.click();
			
			var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', recipeList);
			
			var recipeName = firstRecipe.element(by.className('recipe-name'));
			expect(recipeName.getText()).toBe('First Recipe Name');
		});
		
		it('searches for recipes when enter is typed in the input field', function() {
				
		});

		it('gives a message when no recipes are found', function() {
			expect(noSearchResultsMessage.isDisplayed()).toBe(false);
			
			searchInput.sendKeys('willNeverFindMe');
			searchButton.click();
			
			expect(noSearchResultsMessage.getText()).toBe('No recipes were found that match the search.');
		});

		it('results can be navigated to with a url (ex: with a bookmark)', function() {
			browser.get("/#search-recipes?searchFor=findMe");
			expect(recipeList.count()).toBe(2);
		});
	});

	describe('the Show All Recipes function', function() {

		beforeAll(function() {
			browser.get("/#/search-recipes");
			showAllRecipesButton.click();
		});

		it('shows a list of all recipes when the button is clicked, and a message showing that all recipes are displayed', function() {
			expect(recipeList.count()).toBe(3);

			assertRecipeIsInList(recipe1, recipeList);
			assertRecipeIsInList(recipe2, recipeList);
			assertRecipeIsInList(recipe3, recipeList);

			expect(resultInfoMessage.isDisplayed()).toBe(true);
			expect(resultInfoMessage.getText()).toBe('Showing all recipes');
		});

		function assertRecipeIsInList(recipe, list) {
			var foundRecipes = list.filter(function(item) {
				return item.element(by.className('recipe-name')).getText().then(function(text) {
					return text === recipe.recipeName;
				});
			});
			expect(foundRecipes.count()).toBe(1);
		}
	});

	describe('navigation', function() {
		  
		beforeEach(function() {
			browser.get("/#/search-recipes");
		});
		
		it('for each recipe after searching, clicking the recipe navigates to that recipes individual view page', function() {
			searchInput.sendKeys('findMe');
			searchButton.click();
			
			var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', recipeList);
			
			firstRecipe.getAttribute('id').then(function(recipeId) {
				findRecipeLink(firstRecipe).click();
				expect(browser.getCurrentUrl()).toMatch('/view-recipe/' + recipeId + '$');
			});
		});

		it('when navigating to a recipe, then back to the search page, the search and found recipes are still on the page', function() {
			searchInput.sendKeys('findMe');
			searchButton.click();

			var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', element.all(by.className('recipe')));

			findRecipeLink(firstRecipe).click();
			browser.navigate().back();

			expect(searchInput.getAttribute('value')).toBe('findMe');
			var foundRecipe = pageUtils.findRecipeWithName('First Recipe Name', element.all(by.className('recipe')));
			expect(foundRecipe.isPresent()).toBe(true);
		});
	});

	describe('when recipes are found, they can be added to a users recipe book', function() {

		beforeEach(function() {
			browser.get('/#/search-recipes');
			searchInput.sendKeys('findMe');
			searchButton.click();
		});

		it('for a logged in user', function() {
			var foundRecipe = pageUtils.findRecipeWithName('First Recipe Name', element.all(by.className('recipe')));
			var recipeBookAddButton = foundRecipe.element(by.className('add-to-recipe-book-button'));
			expect(recipeBookAddButton.isDisplayed()).toBe(true);
			expect(recipeBookAddButton.getText()).toBe('Add to Recipe Book');

			recipeBookAddButton.click();
			expect(recipeBookAddButton.isPresent()).toBe(false);
			var inRecipeBookIndicator = foundRecipe.element(by.className('in-recipe-book-indicator'));
			expect(inRecipeBookIndicator.isDisplayed()).toBe(true);
			expect(inRecipeBookIndicator.getText()).toBe('In Recipe Book');

			browser.get('/#/user/' + userId + '/recipe-book');
			var recipeOnRecipeBookPage = pageUtils.findRecipeWithName('First Recipe Name', element.all(by.className('recipe')));
			expect(recipeOnRecipeBookPage.isDisplayed()).toBe(true);

			browser.get('/#/search-recipes?searchFor=findMe');
			expect(inRecipeBookIndicator.isDisplayed()).toBe(true);
		});
	});
});