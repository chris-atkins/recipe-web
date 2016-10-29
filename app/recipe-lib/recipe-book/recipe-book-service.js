'use strict';

angular.module('recipe')

.factory('recipeBookService', function($http, $q, userService) {

	function getRecipeBook(userToRetrieveBookFor) {
		var userId = userToRetrieveBookFor || userService.getLoggedInUser().userId;

		var recipeBookPromise = $q.defer();
		$http.get('/api/user/' + userId + '/recipe-book')
		.success(function(recipeBook) {
			recipeBookPromise.resolve(recipeBook);
		})
		.error(function(error) {
			recipeBookPromise.reject(error);
		});
		return recipeBookPromise.promise;
	}

	function addToRecipeBook(recipeId) {
		var userId = userService.getLoggedInUser().userId;
		var url = '/api/user/' + userId + '/recipe-book';

		var resultPromise = $q.defer();
		$http.post(url, {recipeId: recipeId})
		.success(function() {
			resultPromise.resolve(getRecipeBook());
		})
		.error(function(error) {
			resultPromise.reject(error);
		});
		return resultPromise.promise;
	}

	function removeRecipeFromBook(recipeId) {
		var userId = userService.getLoggedInUser().userId;
		var url = '/api/user/' + userId + '/recipe-book/' + recipeId;

		var resultPromise = $q.defer();
		$http.delete(url)
		.success(function() {
			resultPromise.resolve(getRecipeBook());
		})
		.error(function(error) {
			resultPromise.reject(error);
		});
		return resultPromise.promise;
	}

	return {
		getRecipeBook: getRecipeBook,
		addToRecipeBook: addToRecipeBook,
		removeRecipeFromBook: removeRecipeFromBook
	};
});