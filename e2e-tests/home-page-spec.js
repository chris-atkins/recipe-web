'use strict';

describe('the home page', function() {

  it('should be redirected to when location hash/fragment is empty', function() {
    browser.get('');
    expect(browser.getLocationAbsUrl()).toMatch('/home');
  });
  
  describe('content', function() {

	  beforeAll(function() {
		  browser.get('/#/home');
	  });
		
		it('has a user section', function() {
			var userSection = element(by.className('user-section'));
			expect(userSection.isPresent()).toBe(true);
		});
	  
	  it('has a title', function() {
		  var pageTitle = element(by.id('page-title'));
		  expect(pageTitle.getText()).toBe('Recipe Connection');
	  });
	  
	  it('has a greeting message', function() {
		  var greetingMessage = element(by.id('greeting-message'));
		  expect(greetingMessage.getText()).toBe('What would you like to do?');
	  });

	  it('has a footer with version number and icon message', function() {
		  var footer = element(by.className('footer'));
		  var version = footer.element(by.className('version'));
		  var versionMessage = footer.element(by.className('version-message'));
		  var iconTMInfo = footer.element(by.className('icon-trademark-info'));

		  expect(versionMessage.getText()).toMatch(/^Recipe Connection v.*/);
		  expect(version.getAttribute('app-version')).toBe('show');
		  expect(iconTMInfo.isDisplayed()).toBe(true);
	  });
  });
  
  describe('has navigation buttons:', function() {
	  
	  beforeEach(function() {
		  browser.get('/#/home');
	  });

	  it('has a Search Recipes button that navigates to the search screen', function() {
		  var searchButton = element(by.id('search-button'));
		  expect(searchButton.getText()).toMatch(/^Browse Recipes.*/);
		  searchButton.click();
		  expect(browser.getLocationAbsUrl()).toMatch('/search-recipes');
	  });

	  it('has a Save Recipe button that navigates to the save screen', function() {
		  var saveButton = element(by.id('save-button'));
		  expect(saveButton.getText()).toMatch(/^Save New Recipe.*/);
		  saveButton.click();
		  expect(browser.getLocationAbsUrl()).toMatch('/new-recipe');
	  });
  });
});