'use strict';
var pageUtils = require('./utils/page-utils');
var dataUtils = require('./utils/data-utils');

describe('the new recipe page,', function () {

    var email;
    var recipeNameInput = element(by.css('input#recipe-name-input'));
    var recipeContentInput = element(by.css('trix-editor'));
    var saveButton = element(by.className('save-button'));
    var errorMessage = element(by.className('save-error-message'));
    var allRecipesOnBrowsePage = element.all(by.className('recipe'));

    var loginLink = element(by.className('login-link'));
    var loginButton = element(by.id('log-in-user-button'));
    var loginEmailField = element(by.id('sign-up-user-email'));

	function waitForSaveToSettle() {
		browser.wait(function () {
			return browser.getLocationAbsUrl().then(function (url) {
				return url.includes('/view-recipe/');
			});
		}, 3000);
	}

	describe('when a user is logged in, ', function () {

        beforeAll(function (done) {
            email = dataUtils.randomEmail();
            var user = {userName: 'ohai', userEmail: email};

            dataUtils.postUser(user)
                .then(function () {
                    return pageUtils.login(email);
                })
                .then(done);
        });

        afterAll(function () {
            pageUtils.logout();
        });

        describe('has content: ', function () {

            beforeAll(function () {
                browser.get('/#/new-recipe');
            });

            it('has a user section', function () {
                var navbarSection = element(by.className('navbar-section'));
                expect(navbarSection.isPresent()).toBe(true);
            });

            it('has a title', function () {
                var pageTitle = element(by.id('new-recipe-page-title'));
                expect(pageTitle.getText()).toBe('Save a New Recipe');
            });

            it('has an input to enter the recipe name', function () {
                expect(recipeNameInput.isPresent()).toBe(true);
                expect(recipeNameInput.getAttribute('placeholder')).toBe('Recipe Name');
            });

            it('has text area to enter the recipe content', function () {
                expect(recipeContentInput.isPresent()).toBe(true);
                expect(recipeContentInput.getAttribute('placeholder')).toBe('Recipe Content');
            });

            it('has a save button', function () {
                expect(saveButton.getText()).toBe('Save Recipe');
            });

            it('does not show the error message', function () {
                expect(errorMessage.isDisplayed()).toBe(false);
            });
        });

        describe('the save button', function () {

            var newRecipeName = 'the best test recipe name ever';
            var newRecipeContent = 'belIEVE me';

            beforeEach(function () {
                browser.get('/#/new-recipe');
            });

            afterAll(function (done) {
                dataUtils.removeAllRecipeData(done);
            });

            it('takes the user to the view page for the newly saved recipe', function () {
                recipeNameInput.sendKeys('test name');
                recipeContentInput.sendKeys('test content');

                saveButton.click();
				waitForSaveToSettle();
                expect(browser.getLocationAbsUrl()).toContain('/view-recipe/');


                var recipeNameElement = element(by.id('recipe-name'));
                expect(recipeNameElement.getText()).toBe('test name');

                var recipeContentElement = element(by.id('recipe-content'));
                expect(recipeContentElement.getText()).toBe('test content');
            });

            it('saves whatever was entered in the input fields as a new recipe that can now be navigated to', function () {
                recipeNameInput.sendKeys(newRecipeName);
                recipeContentInput.sendKeys(newRecipeContent);
                saveButton.click();
				waitForSaveToSettle();

                browser.get('/#/search-recipes?searchFor=all');
                var savedRecipeLink = pageUtils.findRecipeWithName(newRecipeName, allRecipesOnBrowsePage);
                savedRecipeLink.click();

                expect(element(by.id('recipe-name')).getText()).toBe(newRecipeName);
                expect(element(by.id('recipe-content')).getText()).toBe(newRecipeContent);
            });
        });
    });

    describe('when a user is not logged in', function () {

        it('does not allow a recipe to be saved and gives an error message', function () {
            browser.get('/#/new-recipe');
            recipeNameInput.sendKeys('recipe name');
            recipeContentInput.sendKeys('this should not be saved');
            saveButton.click();

            expect(errorMessage.isDisplayed()).toBe(true);
            expect(errorMessage.getText()).toBe('In order to save a recipe you must be logged in. Click the \'Log In\' link in the top right corner and enter your email address.');
            expect(browser.getLocationAbsUrl()).toContain('/new-recipe');

            browser.get('/#/browse-all-recipes');
            expect(allRecipesOnBrowsePage.count()).toBe(0);
        });

        it('and saves, the error message goes away once the user logs in', function () {
            browser.get('/#/new-recipe');
            recipeNameInput.sendKeys('recipe name');
            recipeContentInput.sendKeys('this should not be saved');
            saveButton.click();

            expect(errorMessage.isDisplayed()).toBe(true);
            login();

            expect(errorMessage.isDisplayed()).toBe(false);
            pageUtils.logout();
        });

        function login() {
            loginLink.click();
            loginEmailField.sendKeys(email);
            loginButton.click();
        }
    });
});