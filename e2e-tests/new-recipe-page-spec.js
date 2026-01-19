'use strict';
var pageUtils = require('./utils/page-utils');
var dataUtils = require('./utils/data-utils');

// Expected conditions for explicit waits
var EC = protractor.ExpectedConditions;

describe('the new recipe page,', function () {

    var email;
    var recipeNameInput = element(by.css('input#recipe-name-input'));
    var recipeContentInput = element(by.css('trix-editor'));
    var saveButton = element(by.className('save-button'));
    var errorMessage = element(by.className('save-error-message'));
    var allRecipesOnBrowsePage = element.all(by.className('recipe'));

    var loginDropdown = element(by.className('login-dropdown'));
    var loginButton = element(by.id('log-in-user-button'));
    var loginEmailField = element(by.id('sign-up-user-email'));

    // Helper to wait for page load
    function waitForPageLoad() {
        return browser.wait(EC.presenceOf(element(by.className('navbar-section'))), 5000);
    }

    // Helper to wait for new recipe page elements
    function waitForNewRecipePage() {
        return browser.wait(EC.presenceOf(recipeNameInput), 5000);
    }

    // Helper to wait for URL to contain a string
    function waitForUrlToContain(urlPart) {
        return browser.wait(EC.urlContains(urlPart), 5000);
    }

    // Helper to clear login state
    function clearLoginState() {
        return browser.get('')
            .then(function() {
                return browser.executeScript(function() {
                    document.cookie.split(';').forEach(function(c) {
                        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
                    });
                    localStorage.clear();
                });
            })
            .then(function() {
                return browser.refresh();
            })
            .then(function() {
                return waitForPageLoad();
            });
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
            return pageUtils.logout();
        });

        describe('has content: ', function () {

            beforeAll(function () {
                return browser.get('/#/new-recipe')
                    .then(function() {
                        return waitForNewRecipePage();
                    });
            });

            it('has a user section', function () {
                var navbarSection = element(by.className('navbar-section'));
                expect(navbarSection.isPresent()).toBe(true);
            });

            it('has a title', function () {
                var pageTitle = element(by.id('new-recipe-page-title'));
                expect(pageTitle.getText()).toBe('New Recipe');
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
                return browser.get('/#/new-recipe')
                    .then(function() {
                        return waitForNewRecipePage();
                    });
            });

            afterAll(function (done) {
                dataUtils.removeAllRecipeData(done);
            });

            it('takes the user to the view page for the newly saved recipe', function () {
                return browser.wait(EC.elementToBeClickable(recipeNameInput), 5000)
                    .then(function() {
                        return recipeNameInput.sendKeys('test name');
                    })
                    .then(function() {
                        return recipeContentInput.sendKeys('test content');
                    })
                    .then(function() {
                        return saveButton.click();
                    })
                    .then(function() {
                        return waitForUrlToContain('/view-recipe/');
                    })
                    .then(function() {
                        expect(browser.getCurrentUrl()).toContain('/view-recipe/');
                        var recipeNameElement = element(by.id('recipe-name'));
                        expect(recipeNameElement.getText()).toBe('test name');
                        var recipeContentElement = element(by.id('recipe-content'));
                        expect(recipeContentElement.getText()).toBe('test content');
                    });
            });

            it('saves whatever was entered in the input fields as a new recipe that can now be navigated to', function () {
                var recipeNameElement = element(by.id('recipe-name'));
                return browser.wait(EC.elementToBeClickable(recipeNameInput), 5000)
                    .then(function() {
                        return recipeNameInput.sendKeys(newRecipeName);
                    })
                    .then(function() {
                        return recipeContentInput.sendKeys(newRecipeContent);
                    })
                    .then(function() {
                        return saveButton.click();
                    })
                    .then(function() {
                        return waitForUrlToContain('/view-recipe/');
                    })
                    .then(function() {
                        return browser.get('/#/search-recipes?searchFor=all');
                    })
                    .then(function() {
                        return browser.wait(EC.presenceOf(element(by.className('recipe'))), 5000);
                    })
                    .then(function() {
                        var savedRecipeLink = pageUtils.findRecipeWithName(newRecipeName, allRecipesOnBrowsePage);
                        return savedRecipeLink.click();
                    })
                    .then(function() {
                        // Wait for the recipe name text to actually appear (AngularJS binding)
                        return browser.wait(EC.textToBePresentInElement(recipeNameElement, newRecipeName), 5000);
                    })
                    .then(function() {
                        expect(recipeNameElement.getText()).toBe(newRecipeName);
                        expect(element(by.id('recipe-content')).getText()).toBe(newRecipeContent);
                    });
            });
        });
    });

    describe('when a user is not logged in', function () {

        beforeEach(function() {
            return clearLoginState();
        });

        it('does not allow a recipe to be saved and gives an error message', function () {
            return browser.get('/#/new-recipe')
                .then(function() {
                    return waitForNewRecipePage();
                })
                .then(function() {
                    return recipeNameInput.sendKeys('recipe name');
                })
                .then(function() {
                    return recipeContentInput.sendKeys('this should not be saved');
                })
                .then(function() {
                    return saveButton.click();
                })
                .then(function() {
                    return browser.wait(EC.visibilityOf(errorMessage), 5000);
                })
                .then(function() {
                    expect(errorMessage.isDisplayed()).toBe(true);
                    expect(errorMessage.getText()).toBe('In order to save a recipe you must be logged in. Click the \'Log In\' link in the top right corner and enter your email address.');
                    expect(browser.getCurrentUrl()).toContain('/new-recipe');
                    return browser.get('/#/browse-all-recipes');
                })
                .then(function() {
                    return waitForPageLoad();
                })
                .then(function() {
                    expect(allRecipesOnBrowsePage.count()).toBe(0);
                });
        });

        it('and saves, the error message goes away once the user logs in', function () {
            return browser.get('/#/new-recipe')
                .then(function() {
                    return waitForNewRecipePage();
                })
                .then(function() {
                    return recipeNameInput.sendKeys('recipe name');
                })
                .then(function() {
                    return recipeContentInput.sendKeys('this should not be saved');
                })
                .then(function() {
                    return saveButton.click();
                })
                .then(function() {
                    return browser.wait(EC.visibilityOf(errorMessage), 5000);
                })
                .then(function() {
                    expect(errorMessage.isDisplayed()).toBe(true);
                    return loginDropdown.click();
                })
                .then(function() {
                    return browser.wait(EC.visibilityOf(loginEmailField), 5000);
                })
                .then(function() {
                    return loginEmailField.sendKeys(email);
                })
                .then(function() {
                    return loginButton.click();
                })
                .then(function() {
                    return browser.wait(EC.invisibilityOf(errorMessage), 5000);
                })
                .then(function() {
                    expect(errorMessage.isDisplayed()).toBe(false);
                    return pageUtils.logout();
                });
        });
    });
});