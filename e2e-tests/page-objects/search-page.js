'use strict';

var searchInput = element(by.id('search-input'));
var searchButton = element(by.id('search-button'));
var pageTitle = element(by.id('search-recipes-page-title'));
var navbarSection = element(by.className('navbar-section'));
var showAllRecipesButton = element(by.css('button#show-all-recipes-button'));
var homeButton = element(by.id('home-button'));
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
	userSection: navbarSection,
	showAllRecipesButton: showAllRecipesButton,
	homeButton: homeButton,
	recipeListHolder: recipeListHolder,
	recipeList: recipeList,
	resultInfoMessage: resultInfoMessage,
	noSearchResultsMessage: noSearchResultsMessage,
	backButton: backButton,
	findRecipeLink: findRecipeLink
};