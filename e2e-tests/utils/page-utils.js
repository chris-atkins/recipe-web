'use strict';

var EC = protractor.ExpectedConditions;
var loginDropdown = element(by.className('login-dropdown'));
var loginButton = element(by.id('log-in-user-button'));
var loginEmailField = element(by.id('sign-up-user-email'));
var signupNameField = element(by.id('sign-up-user-name'));
var signupButton = element(by.id('sign-up-user-button'));

function findRecipeWithName(recipeName, recipeElements) {
	// Wait for at least one recipe to be present before searching
	browser.wait(function() {
		return recipeElements.count().then(function(count) {
			return count > 0;
		});
	}, 10000, 'Waiting for recipes to load');

	var matchingRecipes = recipeElements.filter(function(item) {
		return item.element(by.className('recipe-name')).getText().then(function(recipeNameText) {
			return (recipeNameText === recipeName);
		});
	});
	expect(matchingRecipes.count()).toBe(1);
	return matchingRecipes.first();
}

function login(userEmail) {
	return browser.get('')
		.then(function() {
			// First ensure we're logged out by clearing cookies and refreshing
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
			return loginWithoutNavigating(userEmail);
		});
}

function loginWithoutNavigating(userEmail) {
	// Wait for login dropdown to be clickable
	return browser.wait(EC.elementToBeClickable(loginDropdown), 5000)
	.then(function() {
		return loginDropdown.click();
	})
	.then(function() {
		// Wait for email field to be visible and interactable
		return browser.wait(EC.visibilityOf(loginEmailField), 5000);
	})
	.then(function() {
		return loginEmailField.sendKeys(userEmail);
	})
	.then(function() {
		return browser.wait(EC.elementToBeClickable(loginButton), 5000);
	})
	.then(function() {
		return loginButton.click();
	})
	.then(function() {
		// Wait for either: signup fields to appear (new user) or dropdown to close (existing user)
		return browser.wait(EC.or(
			EC.visibilityOf(signupNameField),
			EC.invisibilityOf(loginEmailField)
		), 5000);
	})
	.then(function() {
		// Check if signup is needed (new user) - use isPresent which is safer
		return signupNameField.isPresent().then(function(present) {
			if (present) {
				return signupNameField.isDisplayed().then(function(visible) {
					return visible;
				}, function() {
					return false;
				});
			}
			return false;
		});
	})
	.then(function(signupVisible) {
		if (signupVisible) {
			// This is an existing user in the API, no signup needed, just wait for dropdown to close
			return browser.wait(EC.invisibilityOf(loginEmailField), 5000);
		}
	});
}

function logout() {
	// Delete all cookies to ensure clean state
	return browser.manage().deleteAllCookies();
}

module.exports = {
	findRecipeWithName: findRecipeWithName,
	login: login,
	loginWithoutNavigating: loginWithoutNavigating,
	logout: logout
};