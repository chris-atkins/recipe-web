'use strict';

angular.module('recipe.user', [])

.controller('UserCtrl', function($scope, $http, userService) {
	
	$scope.user = userService.getLoggedInUser();
	$scope.isLoggedIn = userService.isLoggedIn();
	
	$scope.loginVisible = false;
	$scope.name = '';
	$scope.email = '';
	
	$scope.toggleLogin = function() {
		$scope.loginVisible = !$scope.loginVisible;
	}
	
	$scope.logIn = function() {
		userService.logIn($scope.name, $scope.email).then(function() {
			$scope.user = userService.getLoggedInUser();
			$scope.isLoggedIn = userService.isLoggedIn();
		});
	}
	
})

.factory('userService', function($http) {
		
	var loggedInUser = {};	
	var loggedIn = false;
	
	var isLoggedIn = function() {
		return loggedIn;
	};
	
	var getLoggedInUser = function() {
		return loggedInUser;
	}
		
	var logIn = function(name, email) {
		var userToSave = {userName: name, userEmail: email}
		
		return $http.post('/api/user', userToSave)
		.success(function(data) {
			loggedInUser = data;
			loggedIn = true;
			return data;
		})
		.error(function(error) {
			console.log('failure saving user:', error);
			return {};
		});
	};
	
	return {
		getLoggedInUser: getLoggedInUser,
		isLoggedIn: isLoggedIn,
		logIn: logIn
	};
});