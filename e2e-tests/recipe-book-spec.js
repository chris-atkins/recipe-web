'use strict';
var dataUtils = require('./data-utils');
var pageUtils = require('./page-utils');

describe('the recipe book system', function() {

	var email;
	var userId;

	var recipeBookButton = element(by.id('recipe-book-button'));
	var errorMessage = element(by.id('recipe-book-error-message'));

	beforeAll(function(done) {
		email = dataUtils.randomEmail();
		var user = {userName: 'ohai', userEmail: email};

		dataUtils.postUser(user)
			.then(function(userResponse) {
				userId = userResponse.userId;
			})
			.then(done);
	});

	afterAll(function() {
		pageUtils.logout();
	});

	describe('on the home page', function() {

		it('has a recipe book link on the home page', function() {
			browser.get('/#/home');

			expect(recipeBookButton.isDisplayed()).toBe(true);
			expect(recipeBookButton.getText()).toBe('My Recipe Book');
			expect(errorMessage.isDisplayed()).toBe(false);
		});

		describe('when a user is logged in', function() {

			beforeAll(function(done) {
				pageUtils.login(email).then(done);
			});

			afterAll(function() {
				pageUtils.logout();
			}); 
			
			it('the recipe book link takes the user to the recipe book page for that user', function() {
				browser.get('/#/home');
				recipeBookButton.click();
				expect(browser.getLocationAbsUrl()).toMatch('/user/' + userId + '/recipe-book');
			});
		});

		describe('when a user is not logged in', function() {
		   
			beforeAll(function() {
				pageUtils.logout();
			});

			it('the recipe book link gives a message when clicked about the need to be logged in', function() {
				browser.get('/#/home');
				recipeBookButton.click();

				expect(errorMessage.isDisplayed()).toBe(true);
				expect(errorMessage.getText()).toContain('must be logged in');
			});

			it('the not-logged-in error message goes away when the user logs in', function(done) {
				browser.get('/#/home');
				recipeBookButton.click();
				expect(errorMessage.isDisplayed()).toBe(true);

				pageUtils.loginWithoutNavigating(email).then(function() {
					expect(errorMessage.isDisplayed()).toBe(false);
				}).then(function() {
					pageUtils.logout();
				}).then(done);
			});
		});
	});

	describe('content on the recipe-book page', function() {

		beforeAll(function() {
			browser.get('/#/user/' + userId + '/recipe-book');
		});

		it('shows a user section', function () {
			var userSection = element(by.className('user-section'));
			expect(userSection.isPresent()).toBe(true);
		});

		it('shows a title', function () {
			var recipeBookTitle = element(by.id('page-title'));
			expect(recipeBookTitle.isDisplayed()).toBe(true);
			expect(recipeBookTitle.getText()).toBe('Recipe Book: ohai');
		});
	});
});