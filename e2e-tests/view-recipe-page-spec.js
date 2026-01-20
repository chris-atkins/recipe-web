'use strict';
var dataUtils = require('./utils/data-utils');
var pageUtils = require('./utils/page-utils');

describe('the vew recipe page', function() {

	var EC = protractor.ExpectedConditions;
	var recipeName = 'Recipe Being Tested - Name';
	var recipeContent = 'Recipe Being Tested - Content';

	var recipeNameElement = element(by.id('recipe-name'));
	var recipeContentElement = element(by.id('recipe-content'));

	var recipeId;
	var email;
	var userId;

	beforeAll(function (done) {
		email = dataUtils.randomEmail();
		var user = {userName: 'ohai', userEmail: email};
		var recipeToAdd = {recipeName: recipeName, recipeContent: recipeContent};

		dataUtils.postUser(user)
			.then(function (postedUser) {
				userId = postedUser.userId;
				return dataUtils.addRecipe(recipeToAdd, userId);
			})
			.then(function (recipe) {
				recipeId = recipe.recipeId;
			}).then(done);
	});

	afterAll(function (done) {
		dataUtils.cleanupData(done);
	});
	
	afterAll(function() {
		pageUtils.logout();
	});

	describe('there is an alternate non-angular recipe page', function() {

		afterAll(function () {
			// Don't re-enable Angular waiting in hybrid app - keep it disabled
			pageUtils.logout();
		});

		it('that matches the view recipe ingredients list perfectly', function(done) {
			var originalPageText;
			browser.get('/#/view-recipe/' + recipeId);

			// Wait for the recipe content to load
			var recipeIngredients = element(by.className('recipe-ingredients'));
			browser.wait(EC.textToBePresentInElement(recipeIngredients, 'Recipe Being Tested'), 5000)
			.then(function() {
				return recipeIngredients.getText();
			})
			.then(function(firstText) {
				originalPageText = firstText;
			}).then(function() {
				// Already disabled from protractor.conf.js onPrepare
				browser.get('/recipe/' + recipeId);
				return element(by.className('recipe-ingredients')).getText();
			}).then(function(alternatePageText) {
				expect(originalPageText).toEqual(alternatePageText);
				// Don't re-enable Angular waiting in hybrid app
			}).then(done, done.fail);
		});
	});

	describe('when no user is logged in', function() {
		describe('content', function () {

			beforeAll(function () {
				browser.get('/#/view-recipe/' + recipeId);
			});

			it('shows a user section', function () {
				var navbarSection = element(by.className('navbar-section'));
				expect(navbarSection.isPresent()).toBe(true);
			});

			it('shows the recipe name', function () {
				expect(recipeNameElement.getText()).toBe(recipeName);
			});

			it('shows the recipe content', function () {
				expect(recipeContentElement.getText()).toBe(recipeContent);
			});

			it('does not show recipe edit or update buttons or edit fields', function() {
				expect(editRecipeButton.isPresent()).toBe(false);
				expect(updateRecipeButton.isPresent()).toBe(false);

				expect(recipeNameInput.isDisplayed()).toBe(false);
				expect(recipeContentInput.isDisplayed()).toBe(false);
			});
		});

		describe('handles multi-line content', function () {
			var multilineRecipeId;
			var newName = 'newName';
			var multilineContent = 'First Line\nSecond Line';

			beforeAll(function (done) {
				var recipeToAdd = {recipeName: newName, recipeContent: multilineContent};
				dataUtils.addRecipe(recipeToAdd, userId).then(function (recipe) {
					multilineRecipeId = recipe.recipeId;
				}).then(done);
			});

			it('shows the content on separate lines', function () {
				browser.get('/#/view-recipe/' + multilineRecipeId);
				var recipeContentElement = element(by.id('recipe-content'));
				// Wait for content to load
				browser.wait(EC.textToBePresentInElement(recipeContentElement, 'First Line'), 5000);

				expect(recipeContentElement.getText()).toBe('First Line\nSecond Line');
			});
		});
	});

	var editRecipeButton = element(by.id('edit-recipe-button'));
	var cancelEditButton = element(by.id('cancel-edit-button'));
	var updateRecipeButton = element(by.id('update-recipe-button'));
	var recipeNameInput = element(by.css('input#recipe-name-input'));
	var recipeContentInput = element(by.css('trix-editor'));
	var editRecipeTitle = element(by.id('edit-recipe-page-title'));

	describe('when a user is logged who is the owner of the recipe', function() {

		beforeAll(function (done) {
			pageUtils.login(email).then(done);
		});

		beforeAll(function() {
			return browser.get('/#/view-recipe/' + recipeId)
				.then(function() {
					// Wait for the recipe name to appear
					return browser.wait(EC.presenceOf(recipeNameElement), 5000);
				})
				.then(function() {
					// Wait for the edit button (indicates API loaded with editable=true)
					return browser.wait(EC.presenceOf(editRecipeButton), 5000);
				});
		});

		afterAll(function () {
			pageUtils.logout();
		});

		it('a recipe edit button appears on the page', function() {
			// Button was already verified present in beforeAll
			expect(editRecipeButton.isPresent()).toBe(true);
			expect(editRecipeButton.isDisplayed()).toBe(true);
			expect(editRecipeButton.getText()).toBe('Edit Recipe');

			expect(updateRecipeButton.isDisplayed()).toBe(false);
		});

		it('when clicking the edit button, editable recipe fields and a save button appear', function() {
			browser.get('/#/search-recipes?searchFor=all');
			var recipe = pageUtils.findRecipeWithName('Recipe Being Tested - Name', element.all(by.className('recipe')));
			recipe.click();
			// Wait for view-recipe page to load and show edit button
			browser.wait(EC.presenceOf(editRecipeButton), 5000);

			editRecipeButton.click();

			expect(editRecipeButton.isDisplayed()).toBe(false);

			expect(cancelEditButton.isDisplayed()).toBe(true);
			expect(cancelEditButton.getText()).toBe('Cancel');

			expect(updateRecipeButton.isDisplayed()).toBe(true);
			expect(updateRecipeButton.getText()).toBe('Save Recipe');

			expect(editRecipeTitle.isDisplayed()).toBe(true);
			expect(editRecipeTitle.getText()).toBe('Edit Recipe');

			expect(recipeNameInput.isDisplayed()).toBe(true);
			expect(recipeNameInput.getAttribute('value')).toBe('Recipe Being Tested - Name');

			expect(recipeContentInput.isDisplayed()).toBe(true);
			expect(recipeContentInput.getAttribute('value')).toContain('Recipe Being Tested - Content');
		});

		it('editing can be cancelled without altering the recipe contents or title', function() {
			browser.get('/#/view-recipe/' + recipeId);
			// Wait for edit button to appear instead of waitForAngular
			browser.wait(EC.presenceOf(editRecipeButton), 5000);
			editRecipeButton.click();

			recipeNameInput.sendKeys('edited');
			recipeContentInput.sendKeys('moreedited');

			cancelEditButton.click();

			expect(recipeNameElement.getText()).toBe('Recipe Being Tested - Name');
			expect(recipeContentElement.getText()).toBe('Recipe Being Tested - Content');

			expect(editRecipeButton.isDisplayed()).toBe(true);
			expect(updateRecipeButton.isDisplayed()).toBe(false);

			browser.get('/#/view-recipe/' + recipeId);
			expect(recipeNameElement.getText()).toBe('Recipe Being Tested - Name');
			expect(recipeContentElement.getText()).toBe('Recipe Being Tested - Content');
		});

		it('the recipe can be updated', function() {
			browser.get('/#/view-recipe/' + recipeId);
			// Wait for edit button to appear instead of waitForAngular
			browser.wait(EC.presenceOf(editRecipeButton), 5000);
			editRecipeButton.click();
			// Wait for input fields to appear after clicking edit
			browser.wait(EC.presenceOf(recipeNameInput), 5000);

			recipeNameInput.sendKeys(protractor.Key.END);
			recipeNameInput.sendKeys('edited');

			recipeContentInput.clear();
			recipeContentInput.sendKeys('Recipe Being Tested - Contentmoreedited');  //FIREFOX WAS NOT WORKING WITH THE 2 BELOW LINES - BUT THEY ARE PREFERABLE
			// recipeContentInput.sendKeys(protractor.Key.END);
			// recipeContentInput.sendKeys('moreedited');

			updateRecipeButton.click();
			// Wait for the update to complete and UI to refresh
			browser.wait(EC.textToBePresentInElement(recipeNameElement, 'Recipe Being Tested - Nameedited'), 5000);

			expect(recipeNameElement.getText()).toBe('Recipe Being Tested - Nameedited');
			expect(recipeContentElement.getText()).toBe('Recipe Being Tested - Contentmoreedited');

			expect(editRecipeButton.isDisplayed()).toBe(true);
			expect(updateRecipeButton.isDisplayed()).toBe(false);

			browser.get('/#/view-recipe/' + recipeId);
			expect(recipeNameElement.getText()).toBe('Recipe Being Tested - Nameedited');
			expect(recipeContentElement.getText()).toBe('Recipe Being Tested - Contentmoreedited');
		});
	});

	describe('when a user is logged in that is not the owner of the recipe', function() {

		beforeAll(function (done) {
			var otherEmail = dataUtils.randomEmail();
			var otherUser = {userName: 'somethingElse', userEmail: otherEmail};

			dataUtils.postUser(otherUser)
				.then(function () {
					return pageUtils.login(otherEmail);
				}).then(done);
		});

		beforeAll(function() {
			browser.get('/#/view-recipe/' + recipeId);
		});

		afterAll(function () {
			pageUtils.logout();
		});

		it('there is no recipe edit button', function() {
			expect(editRecipeButton.isPresent()).toBe(false);
			expect(updateRecipeButton.isPresent()).toBe(false);
		});
	});
});