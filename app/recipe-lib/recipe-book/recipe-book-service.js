'use strict';

angular.module('recipe')

.factory('recipeBookService', function($http, $q, userService) {

	function getRecipeBook(userToRetrieveBookFor) {
		var userId = userToRetrieveBookFor || userService.getLoggedInUser().userId;

		return $http.get('/api/user/' + userId + '/recipe-book')
		.then(function(response) {
			return response.data;
		});
	}

	function addToRecipeBook(recipeId) {
		var userId = userService.getLoggedInUser().userId;
		var url = '/api/user/' + userId + '/recipe-book';

		return $http.post(url, {recipeId: recipeId})
		.then(function() {
			return getRecipeBook();
		});
	}

	function removeRecipeFromBook(recipeId) {
		var userId = userService.getLoggedInUser().userId;
		var url = '/api/user/' + userId + '/recipe-book/' + recipeId;

		return $http.delete(url)
		.then(function() {
			return getRecipeBook();
		});
	}

	return {
		getRecipeBook: getRecipeBook,
		addToRecipeBook: addToRecipeBook,
		removeRecipeFromBook: removeRecipeFromBook
	};
});