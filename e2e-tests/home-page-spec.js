'use strict';
var pageUtils = require('./utils/page-utils');
var dataUtils = require('./utils/data-utils');

describe('the home page', function () {

	var email;

	beforeAll(function (done) {
		email = dataUtils.randomEmail();
		var user = {userName: 'ohai', userEmail: email};

		dataUtils.postUser(user)
		.then(done);
	});

	it('should be redirected to when location hash/fragment is empty', function () {
		browser.get('');
		expect(browser.getCurrentUrl()).toMatch('/home');
	});

	describe('content', function () {

		beforeAll(function () {
			browser.get('/#/home');
		});

		it('has a navbar section', function () {
			var navbarSection = element(by.className('navbar-section'));
			expect(navbarSection.isPresent()).toBe(true);
		});

		it('has a title', function () {
			var pageTitle = element(by.id('page-title'));
			expect(pageTitle.getText()).toBe('Recipe Connection');
		});

		it('has a greeting message', function () {
			var greetingMessage = element(by.id('greeting-message'));
			expect(greetingMessage.getText()).toBe('What would you like to do?');
		});

		it('has a footer with version number and icon message', function () {
			var footer = element(by.className('footer'));
			var version = footer.element(by.className('version'));
			var versionMessage = footer.element(by.className('version-message'));
			var iconTMInfo = footer.element(by.className('icon-trademark-info'));

			expect(versionMessage.getText()).toMatch(/^Recipe Connection v.*/);
			expect(version.getAttribute('app-version')).toBe('show');
			expect(iconTMInfo.isDisplayed()).toBe(true);
		});
	});

	describe('has a navbar', function () {

		beforeAll(function () {
			return pageUtils.login(email);
		});

		afterAll(function () {
			return pageUtils.logout();
		});

		beforeEach(function() {
			return browser.get('').then(function() {
				expect(browser.getCurrentUrl()).toMatch('/home');
			});
		});

		it('with a home button', function() {
			element(by.className('nav-browse-page-link')).click();
			expect(browser.getCurrentUrl()).toMatch('/search-recipes');

			element(by.className('nav-home-page-link')).click();
			expect(browser.getCurrentUrl()).toMatch('/home');
		});

		it('with a browse recipes button', function() {
			element(by.className('nav-browse-page-link')).click();
			expect(browser.getCurrentUrl()).toMatch('/search-recipes');
		});

		it('with a save recipe button', function() {
			element(by.className('nav-save-page-link')).click();
			expect(browser.getCurrentUrl()).toMatch('/new-recipe');
		});

		it('with a recipe book button', function() {
			element(by.className('nav-recipe-book-page-link')).click();
			expect(browser.getCurrentUrl()).toMatch('/recipe-book');
		});
	});

	describe('has navigation buttons:', function () {

		beforeEach(function () {
			browser.get('/#/home');
		});

		describe('when logged in ', function() {

			beforeAll(function () {
				return pageUtils.login(email);
			});

			afterAll(function () {
				return pageUtils.logout();
			});

			it('has a Search Recipes button that navigates to the search screen', function () {
				var searchButton = element(by.id('search-button'));
				expect(searchButton.getText()).toMatch(/^Browse Recipes.*/);
				searchButton.click();
				expect(browser.getCurrentUrl()).toMatch('/search-recipes');
			});

			it('has a Save New Recipe button that navigates to the save recipe screen', function () {
				var searchButton = element(by.id('save-button'));
				expect(searchButton.getText()).toMatch(/^Save New Recipe.*/);
				searchButton.click();
				expect(browser.getCurrentUrl()).toMatch('/new-recipe');
			});

			it('has a My Recipe Book button that navigates to the recipe book screen', function () {
				var searchButton = element(by.id('recipe-book-button'));
				expect(searchButton.getText()).toMatch(/^My Recipe Book.*/);
				searchButton.click();
				expect(browser.getCurrentUrl()).toMatch('/recipe-book');
			});
		});

		describe('when NOT logged in ', function() {

			beforeEach(function () {
				// First navigate to the page
				return browser.get('/#/home')
					.then(function() {
						// Use JavaScript to clear all cookies and localStorage
						return browser.executeScript(function() {
							// Clear cookies
							document.cookie.split(';').forEach(function(c) {
								document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
							});
							// Clear localStorage
							localStorage.clear();
						});
					})
					.then(function() {
						// Refresh to make Angular pick up the cleared state
						return browser.refresh();
					});
			});

			it('the Search Recipes button navigates to the search screen', function () {
				var searchButton = element(by.id('search-button'));
				searchButton.click();
				expect(browser.getCurrentUrl()).toMatch('/search-recipes');
			});

			it('the Save New Recipe button does not navigate', function () {
				var searchButton = element(by.id('save-button'));
				searchButton.click();
				expect(browser.getCurrentUrl()).toMatch('/home');
			});

			it('the My Recipe Book button does not', function () {
				var searchButton = element(by.id('recipe-book-button'));
				searchButton.click();
				expect(browser.getCurrentUrl()).toMatch('/home');
			});
		});
	});
});