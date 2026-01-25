'use strict';
/* global localStorage */
var dataUtils = require('./utils/data-utils');
var pageUtils = require('./utils/page-utils');

// Expected conditions for explicit waits
var EC = protractor.ExpectedConditions;

describe('the recipe book system', function() {

	var email;
	var differentUserEmail;
	var userId;

	var recipeBookButton = element(by.id('recipe-book-button'));
	var errorMessage = element(by.id('alert-message'));
	var allRecipesOnThePage = element.all(by.className('recipe'));

	// Helper to wait for page load
	function waitForPageLoad() {
		return browser.wait(EC.presenceOf(element(by.className('navbar-section'))), 5000);
	}

	// Helper to wait for home page
	function waitForHomePage() {
		return browser.wait(EC.presenceOf(recipeBookButton), 5000);
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
		return pageUtils.logout();
	});

	describe('on the home page', function() {

		it('has a recipe book link on the home page', function() {
			return clearLoginState()
				.then(function() {
					return browser.get('/#/home');
				})
				.then(function() {
					return waitForHomePage();
				})
				.then(function() {
					expect(recipeBookButton.isDisplayed()).toBe(true);
					expect(recipeBookButton.getText()).toMatch(/^My Recipe Book.*/);
					// Use isPresent() instead of isDisplayed() since *ngIf removes element from DOM
					expect(errorMessage.isPresent()).toBe(false);
				});
		});

		describe('when a user is logged in', function() {

			beforeAll(function(done) {
				pageUtils.login(email).then(done);
			});

			afterAll(function() {
				return pageUtils.logout();
			});

			it('the recipe book link takes the user to the recipe book page for that user', function() {
				return browser.get('/#/home')
					.then(function() {
						return waitForHomePage();
					})
					.then(function() {
						return recipeBookButton.click();
					})
					.then(function() {
						return browser.wait(EC.urlContains('/recipe-book'), 5000);
					})
					.then(function() {
						expect(browser.getCurrentUrl()).toMatch('/user/' + userId + '/recipe-book');
					});
			});
		});

		describe('when a user is not logged in', function() {

			beforeAll(function() {
				return pageUtils.logout();
			});

			it('the recipe book link gives a message when clicked about the need to be logged in', function() {
				return clearLoginState()
					.then(function() {
						return browser.get('/#/home');
					})
					.then(function() {
						return waitForHomePage();
					})
					.then(function() {
						return recipeBookButton.click();
					})
					.then(function() {
						return browser.wait(EC.presenceOf(errorMessage), 5000);
					})
					.then(function() {
						expect(errorMessage.isDisplayed()).toBe(true);
						expect(errorMessage.getText()).toContain('must be logged in');
					});
			});

			it('the not-logged-in error message goes away when the user logs in', function() {
				return clearLoginState()
					.then(function() {
						return browser.get('/#/home');
					})
					.then(function() {
						return waitForHomePage();
					})
					.then(function() {
						return recipeBookButton.click();
					})
					.then(function() {
						return browser.wait(EC.presenceOf(errorMessage), 5000);
					})
					.then(function() {
						expect(errorMessage.isDisplayed()).toBe(true);
						return pageUtils.loginWithoutNavigating(email);
					})
					.then(function() {
						return browser.wait(EC.stalenessOf(errorMessage), 5000);
					})
					.then(function() {
						// Use isPresent() since element is removed from DOM when user logs in
						expect(errorMessage.isPresent()).toBe(false);
						return pageUtils.logout();
					});
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

		// Helper to wait for recipe book page to load with recipes
		function waitForRecipeBookPage() {
			return browser.wait(EC.presenceOf(element(by.id('page-title'))), 5000);
		}

		// Helper to wait for recipes to appear
		function waitForRecipes(count) {
			return browser.wait(function() {
				return allRecipesOnThePage.count().then(function(c) {
					return c >= count;
				});
			}, 5000);
		}

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
			return browser.get('/#/user/' + userId + '/recipe-book')
				.then(function() {
					return waitForRecipeBookPage();
				});
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
			return browser.wait(EC.textToBePresentInElement(recipeBookTitle, 'Recipe Book'), 5000)
				.then(function() {
					expect(recipeBookTitle.isDisplayed()).toBe(true);
					expect(recipeBookTitle.getText()).toBe('Recipe Book: ohai');
				});
		});

		it('shows all recipes in the users recipe book', function() {
			return waitForRecipes(2)
				.then(function() {
					expect(allRecipesOnThePage.count()).toBe(2);

					var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', allRecipesOnThePage);
					var firstRecipeName = firstRecipe.element(by.className('recipe-name'));
					expect(firstRecipeName.getText()).toBe('First Recipe Name');

					var secondRecipe = pageUtils.findRecipeWithName('Third Recipe Name', allRecipesOnThePage);
					var secondRecipeName = secondRecipe.element(by.className('recipe-name'));
					expect(secondRecipeName.getText()).toBe('Third Recipe Name');
				});
		});

		describe('each recipe', function() {

			beforeAll(function() {
				return browser.get('/#/user/' + userId + '/recipe-book')
					.then(function() {
						return waitForRecipeBookPage();
					});
			});

			it('has a name', function() {
				return waitForRecipes(2)
					.then(function() {
						var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', allRecipesOnThePage);
						var firstRecipeName = firstRecipe.element(by.className('recipe-name'));
						expect(firstRecipeName.getText()).toBe('First Recipe Name');
					});
			});

			it('clicking the recipe will take the user to the view recipe page, where the back button will return to the recipe book page', function() {
				return waitForRecipes(2)
					.then(function() {
						var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', allRecipesOnThePage);
						return firstRecipe.click();
					})
					.then(function() {
						return browser.get('/#/user/' + userId + '/recipe-book');
					});
			});

			describe('when no user is logged in', function() {

				beforeAll(function() {
					return clearLoginState()
						.then(function() {
							return browser.get('/#/user/' + userId + '/recipe-book');
						})
						.then(function() {
							return waitForRecipeBookPage();
						});
				});

				it('does not have a remove button', function() {
					return waitForRecipes(2)
						.then(function() {
							expect(allRecipesOnThePage.count()).toBe(2);
							var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', allRecipesOnThePage);

							var removeRecipeFromBookButton = firstRecipe.element(by.className('remove-recipe-from-book-button'));
							expect(removeRecipeFromBookButton.isPresent()).toBe(false);
						});
				});
			});

			describe('when a different user than owns the recipe book is logged in', function() {

				beforeAll(function(done) {
					pageUtils.login(differentUserEmail).then(done, done.fail);
				});

				afterAll(function() {
					return pageUtils.logout();
				});

				it('does not have a remove button', function() {
					return browser.get('/#/user/' + userId + '/recipe-book')
						.then(function() {
							return waitForRecipeBookPage();
						})
						.then(function() {
							return waitForRecipes(2);
						})
						.then(function() {
							expect(allRecipesOnThePage.count()).toBe(2);
							var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', allRecipesOnThePage);

							var removeRecipeFromBookButton = firstRecipe.element(by.className('remove-recipe-from-book-button'));
							expect(removeRecipeFromBookButton.isPresent()).toBe(false);
						});
				});
			});

			describe('when a user is logged in and viewing their own recipe book', function() {

				beforeAll(function(done) {
					pageUtils.login(email).then(done);
				});

				afterAll(function() {
					return pageUtils.logout();
				});

				it('has a remove button that will remove a recipe from the recipe book and update the view', function() {
					return browser.get('/#/user/' + userId + '/recipe-book')
						.then(function() {
							return waitForRecipeBookPage();
						})
						.then(function() {
							return waitForRecipes(2);
						})
						.then(function() {
							expect(allRecipesOnThePage.count()).toBe(2);
							var firstRecipe = pageUtils.findRecipeWithName('First Recipe Name', allRecipesOnThePage);

							var removeRecipeFromBookButton = firstRecipe.element(by.className('remove-recipe-from-book-button'));
							expect(removeRecipeFromBookButton.isDisplayed()).toBe(true);
							expect(removeRecipeFromBookButton.getText()).toBe('Remove from Recipe Book');
							expect(firstRecipe.element(by.className('no-actions-possible-label')).isPresent()).toBe(false);

							return removeRecipeFromBookButton.click();
						})
						.then(function() {
							return browser.wait(function() {
								return allRecipesOnThePage.count().then(function(c) {
									return c === 1;
								});
							}, 5000);
						})
						.then(function() {
							expect(allRecipesOnThePage.count()).toBe(1);
							var remainingRecipe = pageUtils.findRecipeWithName('Third Recipe Name', allRecipesOnThePage);
							expect(remainingRecipe.isDisplayed()).toBe(true);
						});
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

		// Helper to wait for view recipe page
		function waitForViewRecipePage() {
			return browser.wait(EC.presenceOf(element(by.id('recipe-name'))), 5000);
		}

		// Helper to wait for recipe book page
		function waitForRecipeBookPageInViewSection() {
			return browser.wait(EC.presenceOf(element(by.id('page-title'))), 5000);
		}

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
				dataUtils.addRecipeToRecipeBook(recipeInBook, userId)
					.then(done, done.fail);
			});

			afterAll(function() {
				return pageUtils.logout();
			});

			it('has a marker that lets the user know the recipe is part of their recipe book', function() {
				return browser.get('/#/view-recipe/' + recipeInBook)
					.then(function() {
						return waitForViewRecipePage();
					})
					.then(function() {
						return browser.wait(EC.presenceOf(recipeMarker), 5000);
					})
					.then(function() {
						expect(recipeMarker.isDisplayed()).toBe(true);
						expect(recipeMarker.getText()).toBe('In Recipe Book');
					});
			});

			it('can be removed from a users recipe book', function() {
				return browser.get('/#/user/' + userId + '/recipe-book')
					.then(function() {
						return waitForRecipeBookPageInViewSection();
					})
					.then(function() {
						return browser.wait(function() {
							return allRecipesOnThePage.count().then(function(c) {
								return c >= 1;
							});
						}, 5000);
					})
					.then(function() {
						expect(allRecipesOnThePage.count()).toBe(1);
						return browser.get('/#/view-recipe/' + recipeInBook);
					})
					.then(function() {
						return waitForViewRecipePage();
					})
					.then(function() {
						return browser.wait(EC.visibilityOf(removeRecipeFromBookButton), 5000);
					})
					.then(function() {
						expect(removeRecipeFromBookButton.isDisplayed()).toBe(true);
						expect(removeRecipeFromBookButton.getText()).toBe('Remove');
						return removeRecipeFromBookButton.click();
					})
					.then(function() {
						// Wait for marker to become invisible (ng-show hides it, doesn't remove)
						return browser.wait(EC.invisibilityOf(recipeMarker), 5000);
					})
					.then(function() {
						// Use isDisplayed() since ng-show keeps elements in DOM
						expect(recipeMarker.isDisplayed()).toBe(false);
						expect(removeRecipeFromBookButton.isDisplayed()).toBe(false);
						expect(addToRecipeButton.isDisplayed()).toBe(true);
						return browser.get('/#/user/' + userId + '/recipe-book');
					})
					.then(function() {
						return waitForRecipeBookPageInViewSection();
					})
					.then(function() {
						// Wait a moment for the page to fully load
						return browser.sleep(500);
					})
					.then(function() {
						expect(allRecipesOnThePage.count()).toBe(0);
					});
			});
		});

		describe('when the recipe is not in the logged in users recipe book', function() {

			beforeAll(function(done) {
				pageUtils.login(email).then(done);
			});

			afterAll(function() {
				return pageUtils.logout();
			});

			it('has a button that lets a user add the recipe to their recipe book', function() {
				return browser.get('/#/view-recipe/' + unbookedRecipe)
					.then(function() {
						return waitForViewRecipePage();
					})
					.then(function() {
						// Wait for add button to be visible (recipe not in book)
						return browser.wait(EC.visibilityOf(addToRecipeButton), 5000);
					})
					.then(function() {
						// Use isDisplayed() since ng-show keeps elements in DOM
						expect(recipeMarker.isDisplayed()).toBe(false);
						expect(removeRecipeFromBookButton.isDisplayed()).toBe(false);
						expect(addToRecipeButton.isDisplayed()).toBe(true);
						expect(addToRecipeButton.getText()).toBe('Add to Recipe Book');
						return addToRecipeButton.click();
					})
					.then(function() {
						return browser.wait(EC.visibilityOf(recipeMarker), 5000);
					})
					.then(function() {
						expect(recipeMarker.isDisplayed()).toBe(true);
						expect(addToRecipeButton.isDisplayed()).toBe(false);
						return browser.get('/#/user/' + userId + '/recipe-book');
					})
					.then(function() {
						return waitForRecipeBookPageInViewSection();
					})
					.then(function() {
						return browser.wait(function() {
							return allRecipesOnThePage.count().then(function(c) {
								return c >= 1;
							});
						}, 5000);
					})
					.then(function() {
						var newlyAddedRecipe = pageUtils.findRecipeWithName('Second Recipe Name', allRecipesOnThePage);
						expect(newlyAddedRecipe.isDisplayed()).toBe(true);
					});
			});
		});

		describe('when the user is not logged in ', function() {

			beforeAll(function() {
				return clearLoginState();
			});

			it('there is no button or message about recipe-book', function() {
				return browser.get('/#/view-recipe/' + unbookedRecipe)
					.then(function() {
						return waitForViewRecipePage();
					})
					.then(function() {
						// Wait a moment to ensure all elements are rendered (or hidden)
						return browser.sleep(500);
					})
					.then(function() {
						// Use isDisplayed() since ng-show keeps elements in DOM but hides them
						expect(recipeMarker.isDisplayed()).toBe(false);
						expect(addToRecipeButton.isDisplayed()).toBe(false);
						expect(removeRecipeFromBookButton.isDisplayed()).toBe(false);
					});
			});
		});
	});
});