'use strict';

angular.module('recipe.recipeBook.service', [])

.factory('recipeBookService', function($http, userService) {

	function getRecipeBookPromise() {
		var userId = userService.getLoggedInUser().userId;
		return $http.get('/api/user/' + userId + '/recipe-book');
	}

	function addToRecipeBook(recipeId) {
		var userId = userService.getLoggedInUser().userId;
		var url = '/api/user/' + userId + '/recipe-book';
		return $http.post(url, {recipeId: recipeId})
		.then(function() {
			return getRecipeBookPromise();
		});
	}

	function removeRecipeFromBook(recipeId) {
		var userId = userService.getLoggedInUser().userId;
		var url = '/api/user/' + userId + '/recipe-book/' + recipeId;
		return $http.delete(url)
		.then(function() {
			return getRecipeBookPromise();
		});
	}

	return {
		getRecipeBookPromise: getRecipeBookPromise,
		addToRecipeBook: addToRecipeBook,
		removeRecipeFromBook: removeRecipeFromBook
	};
});