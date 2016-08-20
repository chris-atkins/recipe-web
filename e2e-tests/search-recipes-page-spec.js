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
			var userSection = element(by.className('user-section'));
			expect(userSection.isPresent()).toBe(true);
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

		it('has a show all recipes button', function() {
			var showAllRecipesButton = element(by.css('button#show-all-recipes-button'));
			expect(showAllRecipesButton.getText()).toBe('Show All Recipes');
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
		  
		beforeEach(function() {
			browser.get("/#/search-recipes");
		});
		
		it('the page starts with the search input having focus', function() {
			expect(browser.driver.switchTo().activeElement().getAttribute('id')).toBe('search-input');
		});
		
		it('searches for recipes when the search button is pressed, and displays info on what results are being shown', function() {
			searchInput.sendKeys('findMe');
			searchButton.click();
			
			expect(element.all(by.className('recipe')).count()).toBe(2);

			expect(element(by.className('result-info-message')).isDisplayed()).toBe(true);
			expect(element(by.className('result-info-message')).getText()).toBe('Showing recipes that match "findMe"');
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

		it('gives a message when no recipes are found', function() {
			var noSearchResultsMessage = element(by.id('no-search-results-message'));
			expect(noSearchResultsMessage.isDisplayed()).toBe(false);
			
			searchInput.sendKeys('willNeverFindMe');
			searchButton.click();
			
			expect(noSearchResultsMessage.getText()).toBe('No recipes were found that match the search.');
		});

		it('results can be navigated to with a url (ex: with a bookmark)', function() {
			browser.get("/#search-recipes?searchFor=findMe");
			expect(element.all(by.className('recipe')).count()).toBe(2);
		});
	});

	describe('the Show All Recipes function', function() {

		var showAllRecipesButton = element(by.css('button#show-all-recipes-button'));

		beforeAll(function() {
			browser.get("/#/search-recipes");
			showAllRecipesButton.click();
		});

		it('shows a list of all recipes when the button is clicked, and a message showing that all recipes are displayed', function() {
			var recipeListHolder = element(by.id('recipe-list'));
			var recipeList = recipeListHolder.all(by.className('recipe'));
			expect(recipeList.count()).toBe(3);

			assertRecipeIsInList(recipe1, recipeList);
			assertRecipeIsInList(recipe2, recipeList);
			assertRecipeIsInList(recipe3, recipeList);

			expect(element(by.className('result-info-message')).isDisplayed()).toBe(true);
			expect(element(by.className('result-info-message')).getText()).toBe('Showing all recipes');
		});

		it('has a link for each recipe', function() {
			var recipeListHolder = element(by.id('recipe-list'));
			var recipeList = recipeListHolder.all(by.className('recipe'));
			var recipeLinks = recipeListHolder.all(by.css('a.view-recipe-link'));

			expect(recipeList.count()).toBe(recipeLinks.count());
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

		it('when navigating to a recipe, then back to the search page, the search and found recipes are still on the page', function() {
			searchInput.sendKeys('findMe');
			searchButton.click();

			var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', element.all(by.className('recipe')));
			var recipeLink = firstRecipe.element(by.css('a.view-recipe-link'));

			recipeLink.click();
			element(by.id('back-button')).click();

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