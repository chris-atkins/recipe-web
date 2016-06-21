'use strict';
var pageUtils = require('./page-utils');
var dataUtils = require('./data-utils');

describe('the new recipe page,', function () {

    var recipeNameInput = element(by.css('input#recipe-name-input'));
    var recipeContentInput = element(by.css('textarea#recipe-content-input'));
    var saveButton = element(by.className('save-button'));
    var errorMessage = element(by.className('save-error-message'));
    var allRecipesOnBrowsePage = element.all(by.className('recipe'));

    describe('when a user is logged in, ', function () {

        beforeAll(function (done) {
            var email = dataUtils.randomEmail();
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
                var userSection = element(by.className('user-section'));
                expect(userSection.isPresent()).toBe(true);
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

            it('does not show the error message', function() {
                expect(errorMessage.isDisplayed()).toBe(false);
            });

            it('has a home button that navigates back to the home page', function () {
                var homeButton = element(by.id('home-button'));
                expect(homeButton.getText()).toBe('Home');
                homeButton.click();
                expect(browser.getLocationAbsUrl()).toMatch('/home');
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

            it('takes the user back to the home page', function () {
                recipeNameInput.sendKeys('test name');
                recipeContentInput.sendKeys('test content');

                saveButton.click();
                expect(browser.getLocationAbsUrl()).toMatch('/home');
            });

            it('saves whatever was entered in the input fields as a new recipe that can now be navigated to', function () {
                recipeNameInput.sendKeys(newRecipeName);
                recipeContentInput.sendKeys(newRecipeContent);
                saveButton.click();

                browser.get('/#/browse-all-recipes');
                var savedRecipeLink = pageUtils.findRecipeWithName(newRecipeName, allRecipesOnBrowsePage).element(by.css('a'));
                savedRecipeLink.click();

                expect(element(by.id('recipe-name')).getText()).toBe(newRecipeName);
                expect(element(by.id('recipe-content')).getText()).toBe(newRecipeContent);
            });
        });
    });

    describe('when a user is not logged in', function() {

        it('does not allow a recipe to be saved and gives an error message', function() {
            browser.get('/#/new-recipe');
            recipeNameInput.sendKeys('recipe name');
            recipeContentInput.sendKeys('this should not be saved');
            saveButton.click();

            expect(errorMessage.isDisplayed()).toBe(true);
            expect(errorMessage.getText()).toBe('In order to save a recipe you must be logged in. Click the link in the top right corner and enter your email address.');
            expect(browser.getLocationAbsUrl()).toContain('/new-recipe');

            browser.get('/#/browse-all-recipes');
            expect(allRecipesOnBrowsePage.count()).toBe(0);
        });
    });
});