'use strict';

angular.module('recipe.user', [])

.controller('UserCtrl', function($scope, $http) {
	
	$scope.loginVisible = false;
	$scope.isLoggedIn = false;
	$scope.name = '';
	$scope.email = '';
	$scope.user = {};
	
	$scope.toggleLogin = function() {
		$scope.loginVisible = !$scope.loginVisible;
	}
	
	$scope.logIn = function() {
		var userToSave = {
				userName: $scope.name, 
				userEmail: $scope.email
			};
			
		$http.post('/api/user', userToSave)
			.success(function(data) {
				$scope.user = data;
				$scope.isLoggedIn = true;
				console.log('successfully saved a new user', $scope.user);
			})
			.error(function(error) {
				console.log('failure saving user:', error);
			});
	}
	
});