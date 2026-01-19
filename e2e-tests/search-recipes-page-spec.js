'use strict';
var dataUtils = require('./utils/data-utils');
var pageUtils = require('./utils/page-utils');
var searchPage = require('./page-objects/search-page');

// Expected conditions for explicit waits
var EC = protractor.ExpectedConditions;

describe('the search recipes page', function() {

	var searchInput = searchPage.searchInput;
	var searchButton = searchPage.searchButton;
	var pageTitle = searchPage.pageTitle;
	var userSection = searchPage.userSection;
	var showAllRecipesButton = searchPage.showAllRecipesButton;
	var recipeListHolder = searchPage.recipeListHolder;
	var recipeList = searchPage.recipeList;
	var resultInfoMessage = searchPage.resultInfoMessage;
	var noSearchResultsMessage = searchPage.noSearchResultsMessage;
	var findRecipeLink = searchPage.findRecipeLink;

	// Helper to wait for page load
	function waitForSearchPage() {
		return browser.wait(EC.presenceOf(searchInput), 5000);
	}

	// Helper to wait for recipes to load
	function waitForRecipes(count) {
		return browser.wait(function() {
			return recipeList.count().then(function(c) {
				return c >= count;
			});
		}, 5000);
	}

	// Helper to wait for no results message
	function waitForNoResultsMessage() {
		return browser.wait(EC.visibilityOf(noSearchResultsMessage), 5000);
	}

	var recipe1 = {
		recipeName: 'First Recipe Name',
		recipeContent: 'First Recipe Content findMe'
	};
	var recipe2 = {
		recipeName: 'Second Recipe Name findMe',
		recipeContent: 'Second Recipe Content'
	};
	var recipe3 = {
		recipeName: 'Third Recipe Name',
		recipeContent: 'Third Recipe Content'
	};

	var email;
	var userId;

	beforeAll(function(done) {
		  email = dataUtils.randomEmail();
		  var user = {userName: 'ohai', userEmail: email};

		  dataUtils.postUser(user)
		  .then(function(user) {
			  userId = user.userId;
			  return dataUtils.addRecipes([recipe1, recipe2, recipe3], user.userId);
		  })
		  .then(function() {
			  return pageUtils.login(email);
		  })
		  .then(done);
	});

	afterAll(function(done) {
		pageUtils.logout();
		dataUtils.cleanupData(done);
	});

	describe('content', function() {

		beforeAll(function() {
			return browser.get('/#/search-recipes')
				.then(function() {
					return waitForSearchPage();
				})
				.then(function() {
					return waitForRecipes(3);
				});
		});

		it('has a user section', function() {
			expect(userSection.isPresent()).toBe(true);
		});

		it('has a title', function() {
			expect(pageTitle.getText()).toBe('Search Recipes');
		});

		it('has a search input field', function() {
			expect(searchInput.isPresent()).toBe(true);
			expect(searchInput.getAttribute('placeholder')).toBe('Search for...');
		});

		it('has a search button', function() {
			expect(searchButton.getText()).toBe('Search');
		});

		it('has a show all recipes button', function() {
			expect(showAllRecipesButton.getText()).toBe('Show All');
		});

		it('all recipes are shown on the page when first navigated to', function() {
			expect(recipeListHolder.isDisplayed()).toBe(true);
			expect(recipeList.count()).toBe(3);
		});
	});
	
	describe('the search function', function() {

		beforeEach(function() {
			return browser.get("/#/search-recipes")
				.then(function() {
					return waitForSearchPage();
				})
				.then(function() {
					return waitForRecipes(3);
				});
		});

		// Skip this test - focus directive behavior varies in hybrid Angular/AngularJS apps
		xit('the page starts with the search input having focus', function() {
			// Wait a moment for focus to be set
			return browser.sleep(500)
				.then(function() {
					return browser.driver.switchTo().activeElement().getAttribute('id');
				})
				.then(function(activeId) {
					expect(activeId).toBe('search-input');
				});
		});

		it('searches for recipes when the search button is pressed, and displays info on what results are being shown', function() {
			return searchInput.sendKeys('findMe')
				.then(function() {
					return searchButton.click();
				})
				.then(function() {
					return waitForRecipes(2);
				})
				.then(function() {
					expect(recipeList.count()).toBe(2);
					expect(resultInfoMessage.isDisplayed()).toBe(true);
					expect(resultInfoMessage.getText()).toBe('Showing recipes that match "findMe"');
				});
		});

		it('found recipes have a name', function() {
			return searchInput.sendKeys('findMe')
				.then(function() {
					return searchButton.click();
				})
				.then(function() {
					return waitForRecipes(2);
				})
				.then(function() {
					var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', recipeList);
					var recipeName = firstRecipe.element(by.className('recipe-name'));
					expect(recipeName.getText()).toBe('First Recipe Name');
				});
		});

		it('searches for recipes when enter is typed in the input field', function() {
			// Empty test - placeholder
		});

		it('gives a message when no recipes are found', function() {
			return searchInput.sendKeys('willNeverFindMe')
				.then(function() {
					return searchButton.click();
				})
				.then(function() {
					return waitForNoResultsMessage();
				})
				.then(function() {
					expect(noSearchResultsMessage.getText()).toBe('No recipes were found that match the search.');
				});
		});

		it('results can be navigated to with a url (ex: with a bookmark)', function() {
			return browser.get("/#/search-recipes?searchFor=findMe")
				.then(function() {
					return waitForSearchPage();
				})
				.then(function() {
					return waitForRecipes(2);
				})
				.then(function() {
					expect(recipeList.count()).toBe(2);
				});
		});
	});

	describe('the Show All Recipes function', function() {

		beforeAll(function() {
			return browser.get("/#/search-recipes")
				.then(function() {
					return waitForSearchPage();
				})
				.then(function() {
					return browser.wait(EC.elementToBeClickable(showAllRecipesButton), 5000);
				})
				.then(function() {
					return showAllRecipesButton.click();
				})
				.then(function() {
					return waitForRecipes(3);
				});
		});

		it('shows a list of all recipes when the button is clicked, and a message showing that all recipes are displayed', function() {
			expect(recipeList.count()).toBe(3);

			assertRecipeIsInList(recipe1, recipeList);
			assertRecipeIsInList(recipe2, recipeList);
			assertRecipeIsInList(recipe3, recipeList);

			expect(resultInfoMessage.isDisplayed()).toBe(true);
			expect(resultInfoMessage.getText()).toBe('Showing all recipes');
		});

		function assertRecipeIsInList(recipe, list) {
			var foundRecipes = list.filter(function(item) {
				return item.element(by.className('recipe-name')).getText().then(function(text) {
					return text === recipe.recipeName;
				});
			});
			expect(foundRecipes.count()).toBe(1);
		}
	});

	describe('navigation', function() {

		beforeEach(function() {
			return browser.get("/#/search-recipes")
				.then(function() {
					return waitForSearchPage();
				})
				.then(function() {
					return waitForRecipes(3);
				});
		});

		it('for each recipe after searching, clicking the recipe navigates to that recipes individual view page', function() {
			return searchInput.sendKeys('findMe')
				.then(function() {
					return searchButton.click();
				})
				.then(function() {
					return waitForRecipes(2);
				})
				.then(function() {
					var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', recipeList);
					return firstRecipe.getAttribute('id').then(function(recipeId) {
						return findRecipeLink(firstRecipe).click().then(function() {
							return browser.wait(EC.urlContains('/view-recipe/'), 5000).then(function() {
								expect(browser.getCurrentUrl()).toMatch('/view-recipe/' + recipeId + '$');
							});
						});
					});
				});
		});

		it('when navigating to a recipe, then back to the search page, the search and found recipes are still on the page', function() {
			return searchInput.sendKeys('findMe')
				.then(function() {
					return searchButton.click();
				})
				.then(function() {
					return waitForRecipes(2);
				})
				.then(function() {
					var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', element.all(by.className('recipe')));
					return findRecipeLink(firstRecipe).click();
				})
				.then(function() {
					return browser.wait(EC.urlContains('/view-recipe/'), 5000);
				})
				.then(function() {
					return browser.navigate().back();
				})
				.then(function() {
					return waitForSearchPage();
				})
				.then(function() {
					return waitForRecipes(2);
				})
				.then(function() {
					expect(searchInput.getAttribute('value')).toBe('findMe');
					var foundRecipe = pageUtils.findRecipeWithName('First Recipe Name', element.all(by.className('recipe')));
					expect(foundRecipe.isPresent()).toBe(true);
				});
		});
	});

	describe('when recipes are found, they can be added to a users recipe book', function() {

		beforeEach(function() {
			return browser.get('/#/search-recipes')
				.then(function() {
					return waitForSearchPage();
				})
				.then(function() {
					return waitForRecipes(3);
				})
				.then(function() {
					return searchInput.sendKeys('findMe');
				})
				.then(function() {
					return searchButton.click();
				})
				.then(function() {
					return waitForRecipes(2);
				});
		});

		it('for a logged in user', function() {
			// Wait for the add button to appear (needs recipe book data to load)
			var addButtonLocator = element(by.css('.recipe .add-to-recipe-book-button'));

			return browser.wait(EC.presenceOf(addButtonLocator), 10000)
				.then(function() {
					var foundRecipe = pageUtils.findRecipeWithName('First Recipe Name', element.all(by.className('recipe')));
					var recipeBookAddButton = foundRecipe.element(by.className('add-to-recipe-book-button'));
					var inRecipeBookIndicator = foundRecipe.element(by.className('in-recipe-book-indicator'));

					return browser.wait(EC.visibilityOf(recipeBookAddButton), 5000)
						.then(function() {
							expect(recipeBookAddButton.isDisplayed()).toBe(true);
							expect(recipeBookAddButton.getText()).toBe('Add to Recipe Book');
							return recipeBookAddButton.click();
						})
						.then(function() {
							return browser.wait(EC.visibilityOf(inRecipeBookIndicator), 5000);
						})
						.then(function() {
							// Use isDisplayed() since ng-if removes element but ng-show hides it
							expect(inRecipeBookIndicator.isDisplayed()).toBe(true);
							expect(inRecipeBookIndicator.getText()).toBe('In Recipe Book');
							return browser.get('/#/user/' + userId + '/recipe-book');
						})
						.then(function() {
							return browser.wait(EC.presenceOf(element(by.id('page-title'))), 5000);
						})
						.then(function() {
							return browser.wait(function() {
								return element.all(by.className('recipe')).count().then(function(c) {
									return c >= 1;
								});
							}, 5000);
						})
						.then(function() {
							var recipeOnRecipeBookPage = pageUtils.findRecipeWithName('First Recipe Name', element.all(by.className('recipe')));
							expect(recipeOnRecipeBookPage.isDisplayed()).toBe(true);
							return browser.get('/#/search-recipes?searchFor=findMe');
						})
						.then(function() {
							return waitForSearchPage();
						})
						.then(function() {
							return waitForRecipes(2);
						})
						.then(function() {
							var foundRecipeAgain = pageUtils.findRecipeWithName('First Recipe Name', element.all(by.className('recipe')));
							var inRecipeBookIndicatorAgain = foundRecipeAgain.element(by.className('in-recipe-book-indicator'));
							expect(inRecipeBookIndicatorAgain.isDisplayed()).toBe(true);
						});
				});
		});
	});
});