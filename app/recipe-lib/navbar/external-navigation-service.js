'use strict';

angular.module('recipe')

.factory('externalNavigationService', function ($window) {

	var navigateTo = function(location) {
		$window.location.href = location;
	};

	return {
		navigateTo: navigateTo
	};
});
