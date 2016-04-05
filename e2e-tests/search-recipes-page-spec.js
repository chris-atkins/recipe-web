'use strict';

fdescribe('the search recipes page', function() {
	
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
	});
	
	describe('the search function', function() {
		
		it('searches for recipes when the search button is pressed', function() {
			
		});
		
		it('found recipes have a name and view button', function() {
			
		});
		
		it('searches for recipes when enter is typed in the input field', function() {
			
		});
		
		it('search results can be navigated to through the url', function() {
			
		});
	});
	
	describe('navigation', function() {
		
		beforeEach(function() {
			browser.get("/#search-recipes");
		});
		
		it('the home button navigates to the home page', function() {
			var homeButton = element(by.id('home-button'));
			homeButton.click();
			expect(browser.getLocationAbsUrl()).toMatch('/home');
		});
		
		it('for each recipe after searching, has view recipe buttons that navigate to the individual recipes', function() {
			
		});
	});
	
});