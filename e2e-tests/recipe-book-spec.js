'use strict';
var dataUtils = require('./utils/data-utils');
var pageUtils = require('./utils/page-utils');

describe('the recipe book system', function() {

	var email;
	var differentUserEmail;
	var userId;

	var recipeBookButton = element(by.id('recipe-book-button'));
		var errorMessage = element(by.id('alert-message'));
	var allRecipesOnThePage = element.all(by.className('recipe'));

	beforeAll(function(done) {
		email = dataUtils.randomEmail();
		differentUserEmail = dataUtils.randomEmail();
		var user = {userName: 'ohai', userEmail: email};
		var otherUser = {userName: 'other', userEmail: differentUserEmail};

		dataUtils.postUser(user)
			.then(function(userResponse) {
				userId = userResponse.userId;
			})
			.then(function() {
				return dataUtils.postUser(otherUser);
			})
			.then(done, done.fail);
	});

	afterAll(function() {
		pageUtils.logout();
	});

	describe('on the home page', function() {

		it('has a recipe book link on the home page', function() {
			browser.get('/#/home');

			expect(recipeBookButton.isDisplayed()).toBe(true);
			expect(recipeBookButton.getText()).toMatch(/^My Recipe Book.*/);
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
				browser.wait(function() {
					return browser.getLocationAbsUrl().then(function(url){
						return url.includes('/recipe-book');
					});
				}, 3000);
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

		it('shows a user section', function () {
			var navbarSection = element(by.className('navbar-section'));
			expect(navbarSection.isPresent()).toBe(true);
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

			it('clicking the recipe will take the user to the view recipe page, where the back button will return to the recipe book page', function() {
				var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', allRecipesOnThePage);
				firstRecipe.click();
				browser.get('/#/user/' + userId + '/recipe-book');
			});

			describe('when no user is logged in', function() {

				beforeAll(function() {
					pageUtils.logout();
				});

				it('does not have a remove button', function() {
					expect(allRecipesOnThePage.count()).toBe(2);
					var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', allRecipesOnThePage);

					var removeRecipeFromBookButton = firstRecipe.element(by.className('remove-recipe-from-book-button'));
					expect(removeRecipeFromBookButton.isPresent()).toBe(false);
				});
			});

			describe('when a different user than owns the recipe book is logged in', function() {

				beforeAll(function(done) {
					pageUtils.login(differentUserEmail).then(done, done.fail);
				});

				afterAll(function() {
					pageUtils.logout();
				});

				it('does not have a remove button', function() {
					expect(allRecipesOnThePage.count()).toBe(2);
					var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', allRecipesOnThePage);

					var removeRecipeFromBookButton = firstRecipe.element(by.className('remove-recipe-from-book-button'));
					expect(removeRecipeFromBookButton.isPresent()).toBe(false);
				});
			});

			describe('when a user is logged in and viewing their own recipe book', function() {

				beforeAll(function(done) {
					pageUtils.login(email).then(done);
				});

				afterAll(function() {
					pageUtils.logout();
				});

				it('has a remove button that will remove a recipe from the recipe book and update the view', function() {
					expect(allRecipesOnThePage.count()).toBe(2);
					var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', allRecipesOnThePage);

					var removeRecipeFromBookButton = firstRecipe.element(by.className('remove-recipe-from-book-button'));
					expect(removeRecipeFromBookButton.isDisplayed()).toBe(true);
					expect(removeRecipeFromBookButton.getText()).toBe('Remove from Recipe Book');
					expect(firstRecipe.element(by.className('no-actions-possible-label')).isPresent()).toBe(false);

					removeRecipeFromBookButton.click();

					expect(allRecipesOnThePage.count()).toBe(1);
					var remainingRecipe = pageUtils.findRecipeWithName('Third Recipe Name', allRecipesOnThePage);
					expect(remainingRecipe.isDisplayed()).toBe(true);
				});
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
		var removeRecipeFromBookButton = element(by.className('remove-recipe-from-book-button'));

		describe('when the recipe is in the logged in users recipe book', function() {
			beforeAll(function(done) {
				pageUtils.login(email).then(done);
			});

			afterAll(function(done) {
				dataUtils.addRecipeToRecipeBook(recipeInBook.recipeId, userId)
					.then(done, done.fail);
			});

			afterAll(function() {
				pageUtils.logout();
			});

			it('has a marker that lets the user know the recipe is part of their recipe book', function() {
				browser.get('/#/view-recipe/' + recipeInBook);

				expect(recipeMarker.isDisplayed()).toBe(true);
				expect(recipeMarker.getText()).toBe('In Recipe Book');
			});

			it('can be removed from a users recipe book', function() {
				browser.get('/#/user/' + userId + '/recipe-book');
				expect(allRecipesOnThePage.count()).toBe(1);

				browser.get('/#/view-recipe/' + recipeInBook);

				expect(removeRecipeFromBookButton.isDisplayed()).toBe(true);
				expect(removeRecipeFromBookButton.getText()).toBe('Remove');

				removeRecipeFromBookButton.click();

				expect(recipeMarker.isDisplayed()).toBe(false);
				expect(removeRecipeFromBookButton.isDisplayed()).toBe(false);
				expect(addToRecipeButton.isDisplayed()).toBe(true);

				browser.get('/#/user/' + userId + '/recipe-book');
				expect(allRecipesOnThePage.count()).toBe(0);
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
				expect(removeRecipeFromBookButton.isDisplayed()).toBe(false);
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
				expect(removeRecipeFromBookButton.isDisplayed()).toBe(false);
			});
		});
	});
});