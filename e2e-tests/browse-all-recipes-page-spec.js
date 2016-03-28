'use strict';
var dataUtils = require('./data-utils');

describe('the home page', function() {

  var recipe1 = {
		  recipeName: 'First Recipe Name',
		  recipeContent: 'First Recipe Content'
  };
  var recipe2 = {
		  recipeName: 'Second Recipe Name',
		  recipeContent: 'Second Recipe Content'
  };
  var recipe3 = {
		  recipeName: 'Third Recipe Name',
		  recipeContent: 'Third Recipe Content'
  }
  
  beforeAll(function(done) {
	  dataUtils.addRecipes([recipe1, recipe2, recipe3]).then(done);
  });
  
  afterAll(function(done) {
	  dataUtils.cleanupData(done);
  });
  
  describe('content', function() {

	  beforeAll(function() {
		  browser.get('/#/browse-all-recipes');
	  });
	  
	  it('has a title', function() {
		  var pageTitle = element(by.id('page-title'))
		  expect(pageTitle.getText()).toBe('Browse All Recipes');
	  });
	  
	  it('has a list of all recipes', function() {
		  var recipeListHolder = element(by.id('recipe-list'));
		  var recipeList = recipeListHolder.all(by.className('recipe'));
		  expect(recipeList.count()).toBeGreaterThan(2);  //at least 3, since we added 3 in beforeAll
		  
		  assertRecipeIsInList(recipe1, recipeList);
		  assertRecipeIsInList(recipe2, recipeList);
		  assertRecipeIsInList(recipe3, recipeList);
	  });
	  
	  function assertRecipeIsInList(recipe, list) {
		var foundRecipes = list.filter(function(item, index) {
			return item.element(by.className('recipe-name')).getText().then(function(text) {
			    return text === recipe.recipeName;
			  });
		});
		expect(foundRecipes.count()).toBe(1);
	  };
  });
  
  describe('has navigation:', function() {
	  
	  beforeEach(function() {
		    browser.get('/#/browse-all-recipes');
	  });
	  
	  it('has a Home button that navigates to the home page', function() {
		  var homeButton = element(by.id('home-button'));
		  expect(homeButton.getText()).toBe('Home');
		  homeButton.click();
		  expect(browser.getLocationAbsUrl()).toMatch('/home');
	  });
	  
	  it('recipes contain links that take you to the page for that recipe', function() {
		  
	  });
	  
  });
});