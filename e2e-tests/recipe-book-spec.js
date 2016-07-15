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
		};

		var firstRecipeId;

		beforeAll(function(done) {
			dataUtils.addRecipe(recipe1, userId)
			.then(function(recipe) {
				firstRecipeId = recipe.recipeId;
				return dataUtils.addRecipeToRecipeBook(recipe.recipeId, userId);
			})
			.then(function() {
				return dataUtils.addRecipe(recipe2, userId);
			})
			.then(function() {
				return dataUtils.addRecipe(recipe3, userId);
			})
			.then(function(recipe) {
				return dataUtils.addRecipeToRecipeBook(recipe.recipeId, userId);
			})
			.then(done, done.fail);

		});

		beforeEach(function() {
			browser.get('/#/user/' + userId + '/recipe-book');
		});

		afterAll(function(done) {
			dataUtils.cleanupData(done);
		});

		var allRecipesOnThePage = element.all(by.className('recipe'));

		it('shows a user section', function () {
			var userSection = element(by.className('user-section'));
			expect(userSection.isPresent()).toBe(true);
		});

		it('shows a title', function () {
			var recipeBookTitle = element(by.id('page-title'));
			expect(recipeBookTitle.isDisplayed()).toBe(true);
			expect(recipeBookTitle.getText()).toBe('Recipe Book: ohai');
		});

		it('shows all recipes in the users recipe book', function() {
			expect(allRecipesOnThePage.count()).toBe(2);

			var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', allRecipesOnThePage);
			var firstRecipeName = firstRecipe.element(by.className('recipe-name'));
			expect(firstRecipeName.getText()).toBe('First Recipe Name');

			var secondRecipe = pageUtils.findRecipeWithName('Third Recipe Name', allRecipesOnThePage);
			var secondRecipeName = secondRecipe.element(by.className('recipe-name'));
			expect(secondRecipeName.getText()).toBe('Third Recipe Name');
		});

		describe('each recipe', function() {

			beforeAll(function() {
				browser.get('/#/user/' + userId + '/recipe-book');
			});

			it('has a name', function() {
				var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', allRecipesOnThePage);
				var firstRecipeName = firstRecipe.element(by.className('recipe-name'));
				expect(firstRecipeName.getText()).toBe('First Recipe Name');
			});

			it('has a link to take the user to the view recipe page, where the back button will return to the recipe book page', function() {
				var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', allRecipesOnThePage);
				var recipeLink = firstRecipe.element(by.css('a.view-recipe-link'));
				expect(recipeLink.isDisplayed()).toBe(true);
				expect(recipeLink.getText()).toBe('View');
				recipeLink.click();

				expect(browser.getLocationAbsUrl()).toMatch('/view-recipe/' + firstRecipeId);
				element(by.id('back-button')).click();
				expect(browser.getLocationAbsUrl()).toMatch('/user/' + userId + '/recipe-book');
			});
		});
	});

	describe('on the view recipe page', function() {

		var recipe1 = {
			recipeName: 'First Recipe Name',
			recipeContent: 'First Recipe Content'
		};
		var recipe2 = {
			recipeName: 'Second Recipe Name',
			recipeContent: 'Second Recipe Content'
		};

		var recipeInBook;
		var unbookedRecipe;

		beforeAll(function(done) {
			dataUtils.addRecipe(recipe1, userId)
			.then(function(recipe) {
				recipeInBook = recipe.recipeId;
				return dataUtils.addRecipeToRecipeBook(recipe.recipeId, userId);
			})
			.then(function() {
				return dataUtils.addRecipe(recipe2, userId);
			})
			.then(function(recipe) {
				unbookedRecipe = recipe.recipeId;
			})
			.then(done, done.fail);
		});

		afterAll(function(done) {
			dataUtils.cleanupData(done);
		});

		var recipeMarker = element(by.id('in-recipe-book-marker'));
		var addToRecipeButton = element(by.className('add-to-recipe-book-button'));

		describe('when the recipe is in the logged in users recipe book', function() {
			beforeAll(function(done) {
				pageUtils.login(email).then(done);
			});

			afterAll(function() {
				pageUtils.logout();
			});

			it('has a marker that lets the user know the recipe is part of their recipe book', function() {
				browser.get('/#/view-recipe/' + recipeInBook);

				expect(recipeMarker.isDisplayed()).toBe(true);
				expect(recipeMarker.getText()).toBe('In Recipe Book');
			});
		});

		describe('when the recipe is not in the logged in users recipe book', function() {

			beforeAll(function(done) {
				pageUtils.login(email).then(done);
			});

			afterAll(function() {
				pageUtils.logout();
			});

			it('has a button that lets a user add the recipe to their recipe book', function() {
				browser.get('/#/view-recipe/' + unbookedRecipe);

				expect(recipeMarker.isDisplayed()).toBe(false);
				expect(addToRecipeButton.isDisplayed()).toBe(true);
				expect(addToRecipeButton.getText()).toBe('Add to Recipe Book');

				addToRecipeButton.click();
				expect(recipeMarker.isDisplayed()).toBe(true);
				expect(addToRecipeButton.isDisplayed()).toBe(false);

				browser.get('/#/user/' + userId + '/recipe-book');
				var allRecipesOnThePage = element.all(by.className('recipe'));
				var newlyAddedRecipe = pageUtils.findRecipeWithName('Second Recipe Name', allRecipesOnThePage);
				expect(newlyAddedRecipe.isDisplayed()).toBe(true);
			});
		});

		describe('when the user is not logged in ', function() {

			beforeAll(function() {
				pageUtils.logout();
			});

			it('there is no button or message about recipe-book', function() {
				browser.get('/#/view-recipe/' + unbookedRecipe);

				expect(recipeMarker.isDisplayed()).toBe(false);
				expect(addToRecipeButton.isDisplayed()).toBe(false);
			});
		});
	});
});