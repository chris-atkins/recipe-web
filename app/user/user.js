'use strict';

angular.module('recipe.user', [])

.controller('UserCtrl', function($scope, $http) {
	
	$scope.loginVisible = false;
	
	$scope.toggleLogin = function() {
		$scope.loginVisible = !$scope.loginVisible;
	}
});