'use strict';

angular.module('recipe.user', [])

.controller('UserCtrl', function($scope, $http, userService) {
	
	var loginHasBeenAttempted;
	
	$scope.user = userService.getLoggedInUser();
	$scope.isLoggedIn = userService.isLoggedIn();
	
	$scope.loginVisible = false;
	$scope.name = '';
	$scope.email = '';
	
	$scope.toggleLogin = function() {
		$scope.loginVisible = !$scope.loginVisible;
	}
	
	$scope.logIn = function() {
		loginHasBeenAttempted = true;
		userService.logIn($scope.email).then(function() {
			$scope.user = userService.getLoggedInUser();
			$scope.isLoggedIn = userService.isLoggedIn();
		});
	}
	
	$scope.signUp = function() {
		userService.signUp($scope.name, $scope.email).then(function() {
			$scope.user = userService.getLoggedInUser();
			$scope.isLoggedIn = userService.isLoggedIn();
		});
	}
	
	$scope.shouldShowLogIn = function() {
		return $scope.loginVisible && !loginHasBeenAttempted;
	}
	
	$scope.shouldShowSignUp = function() {
		return $scope.loginVisible && loginHasBeenAttempted;
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
		
	var logIn = function(email) {
		return $http.get('api/user?email=' + email)
		.success(function(user) {
			loggedInUser = user;
			loggedIn = true;
			return user;
		})
		.error(function(error) {
			return {};
		});
	}
	
	var signUp = function(name, email) {
		var userToSave = {userName: name, userEmail: email}
		
		return $http.post('/api/user', userToSave)
		.success(function(data) {
			loggedInUser = data;
			loggedIn = true;
			return data;
		})
		.error(function(error) {
			return {};
		});
	};
	
	return {
		getLoggedInUser: getLoggedInUser,
		isLoggedIn: isLoggedIn,
		logIn: logIn,
		signUp: signUp
	};
});