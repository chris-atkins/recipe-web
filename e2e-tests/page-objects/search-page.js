'use strict';

var searchInput = element(by.id('search-input'));
var searchButton = element(by.id('search-button'));
var pageTitle = element(by.id('search-recipes-page-title'));
var userSection = element(by.className('user-section'));
var showAllRecipesButton = element(by.css('button#show-all-recipes-button'));
var homeButton = element(by.id('home-button'));
var recipeTable = element(by.css('table'));
var recipeListHolder = element(by.id('recipe-list'));
var recipeList = recipeListHolder.all(by.className('recipe'));
var resultInfoMessage = element(by.className('result-info-message'));
var noSearchResultsMessage = element(by.id('no-search-results-message'));
var backButton = element(by.id('back-button'));
var findRecipeLink = function(recipeElement) {
	return recipeElement;
};

module.exports = {
	searchInput: searchInput,
	searchButton: searchButton,
	pageTitle: pageTitle,
	userSection: userSection,
	showAllRecipesButton: showAllRecipesButton,
	homeButton: homeButton,
	recipeTable: recipeTable,
	recipeList: recipeList,
	resultInfoMessage: resultInfoMessage,
	noSearchResultsMessage: noSearchResultsMessage,
	backButton: backButton,
	findRecipeLink: findRecipeLink
};