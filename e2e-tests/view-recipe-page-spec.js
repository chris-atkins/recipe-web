'use strict';
var dataUtils = require('./utils/data-utils');
var pageUtils = require('./utils/page-utils');

describe('the vew recipe page', function() {

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

	describe('when no user is logged in', function() {
		describe('content', function () {

			beforeAll(function () {
				browser.get('/#/view-recipe/' + recipeId);
			});

			it('shows a user section', function () {
				var userSection = element(by.className('user-section'));
				expect(userSection.isPresent()).toBe(true);
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

				expect(recipeContentElement.getText()).toBe('First Line\nSecond Line');
			});
		});

		describe('navigation', function () {

			beforeEach(function () {
				browser.get('/#/view-recipe/' + recipeId);
			});

			it('has a home button that navigates to the home page', function () {
				var homeButton = element(by.id('home-button'));
				expect(homeButton.getText()).toBe('Home');
				homeButton.click();
				expect(browser.getLocationAbsUrl()).toMatch('/home');
			});

		});
	});

	describe('the back button', function() {

		var backButton = element(by.id('back-button'));

		it('navigates back to the browse screen if it was the path used to get to the view page', function() {
			browser.get('/#/search-recipes?searchFor=all');

			var allRecipes = element.all(by.className('recipe'));
			var recipe = pageUtils.findRecipeWithName('Recipe Being Tested - Name', allRecipes);

			recipe.click();
			expect(browser.getLocationAbsUrl()).toMatch('/view-recipe/' + recipeId);

			expect(backButton.isPresent()).toBe(true);
			expect(backButton.isDisplayed()).toBe(true);
			backButton.click();

			expect(browser.getLocationAbsUrl()).toBe('/search-recipes?searchFor=all');
		});

		it('navigates back to the browse screen if it was the path used to get to the view page', function() {
			browser.get("/#/search-recipes");

			var searchInput = element(by.id('search-input'));
			var searchButton = element(by.id('search-button'));
			searchInput.sendKeys('Recipe');
			searchButton.click();

			var recipe = pageUtils.findRecipeWithName('Recipe Being Tested - Name', element.all(by.className('recipe')));

			recipe.click();
			expect(browser.getLocationAbsUrl()).toMatch('/view-recipe/' + recipeId);

			expect(backButton.isPresent()).toBe(true);
			expect(backButton.isDisplayed()).toBe(true);
			backButton.click();

			expect(browser.getLocationAbsUrl()).toMatch('/search-recipes');
		});

		it('does not show up if there was no previous screen (like if it was navigated to with a bookmark)', function() {
			browser.get('/#/view-recipe/' + recipeId);
			browser.refresh();

			expect(backButton.isPresent()).toBe(false);
		});
	});


	var editRecipeButton = element(by.id('edit-recipe-button'));
	var homeButton = element(by.id('home-button'));
	var backButton = element(by.id('back-button'));
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
			browser.get('/#/view-recipe/' + recipeId);
		});

		afterAll(function () {
			pageUtils.logout();
		});

		it('a recipe edit button appears on the page', function() {
			expect(editRecipeButton.isPresent()).toBe(true);
			expect(editRecipeButton.isDisplayed()).toBe(true);
			expect(editRecipeButton.getText()).toBe('Edit Recipe');

			expect(updateRecipeButton.isDisplayed()).toBe(false);
		});

		it('when clicking the edit button, editable recipe fields and a save button appear', function() {
			browser.get('/#/search-recipes?searchFor=all');
			var recipe = pageUtils.findRecipeWithName('Recipe Being Tested - Name', element.all(by.className('recipe')));
			recipe.click();

			editRecipeButton.click();

			expect(editRecipeButton.isDisplayed()).toBe(false);
			expect(homeButton.isDisplayed()).toBe(false);
			expect(backButton.isDisplayed()).toBe(false);

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
			editRecipeButton.click();

			recipeNameInput.sendKeys(protractor.Key.END);
			recipeNameInput.sendKeys('edited');
			recipeContentInput.sendKeys(protractor.Key.END);
			recipeContentInput.sendKeys('moreedited');

			updateRecipeButton.click();

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