'use strict';

describe('the home page', function() {

  it('should be redirected to when location hash/fragment is empty', function() {
    browser.get('');
//    browser.getCurrentUrl().then(function(url) {console.log(url);});
    expect(browser.getLocationAbsUrl()).toMatch('/home');
  });
  
  describe('content', function() {

	  beforeAll(function() {
		  browser.get('/app/#/home');
	  });
	  
	  it('has a title', function() {
		  var pageTitle = element(by.id('page-title'))
		  expect(pageTitle.getText()).toBe('Recipe Connection');
	  });
	  
	  it('has a greeting message', function() {
		  var greetingMessage = element(by.id('greeting-message'));
		  expect(greetingMessage.getText()).toBe('What would you like to do?');
	  });
  });
  
  describe('has navigation buttons:', function() {
	  
	  beforeEach(function() {
		  browser.get('/app/#/home');
	  });
	  
	  it('has a Browse All button that navigates to the browse all screen', function() {
		  var browseAllButton = element(by.id('browse-all-button'));
		  expect(browseAllButton.getText()).toBe('Browse All Recipes');
		  browseAllButton.click();
		  expect(browser.getLocationAbsUrl()).toMatch('/browse-all-recipes');
	  });
	  
	  it('has a Search Recipes button that navigates to the search screen', function() {
		  var searchButton = element(by.id('search-button'));
		  expect(searchButton.getText()).toBe('Search Recipes');
		  searchButton.click();
		  expect(browser.getLocationAbsUrl()).toMatch('/search-recipes');
	  });
	  
	  it('has a Save Recipe button that navigates to the save screen', function() {
		  var saveButton = element(by.id('save-button'));
		  expect(saveButton.getText()).toBe('Save New Recipe');
		  saveButton.click();
		  expect(browser.getLocationAbsUrl()).toMatch('/save-recipe');
	  });
	  
	  
  });
});