'use strict';

angular.module('recipe.user', [])

.controller('UserCtrl', function($scope, $http) {
	
	$scope.loginVisible = false;
	
	$scope.showLogin = function() {
		$scope.loginVisible = true;
	}
});