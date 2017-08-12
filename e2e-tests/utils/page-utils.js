'use strict';

var loginDropdown = element(by.className('login-dropdown'));
var loginButton = element(by.id('log-in-user-button'));
var loginEmailField = element(by.id('sign-up-user-email'));

function findRecipeWithName(recipeName, recipeElements) {
	var matchingRecipes = recipeElements.filter(function(item) {
		return item.element(by.className('recipe-name')).getText().then(function(recipeNameText) {
			return (recipeNameText === recipeName);
		});
	});
	expect(matchingRecipes.count()).toBe(1);
	return matchingRecipes.first();	
}

function login(userEmail) {
	return browser.get('').then(function() {
		return loginWithoutNavigating(userEmail);
	});
}

function loginWithoutNavigating(userEmail) {
	return loginDropdown.click()
	.then(function() {
		browser.waitForAngular();
		loginEmailField.sendKeys(userEmail);
	})
	.then(function() {
		browser.waitForAngular();
		loginButton.click();
		browser.waitForAngular();
	});
}

function logout() {
	return browser.manage().deleteCookie('myrecipeconnection.com.usersLoggedInFromThisBrowser');
}

module.exports = {
	findRecipeWithName: findRecipeWithName,
	login: login,
	loginWithoutNavigating: loginWithoutNavigating,
	logout: logout
};