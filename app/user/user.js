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

.factory('userService', function($http, $cookies) {
	
	var userCookieKey = 'myrecipeconnection.com.usersLoggedInFromThisBrowser';
	var now = new Date();
    var cookieExpires = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate());
	
	var loggedIn;
	var loggedInUser;
	
	initializeUserAndLoggedInStatus();
	
	var isLoggedIn = function() {
		return loggedIn;
	};
	
	var getLoggedInUser = function() {
		return loggedInUser;
	}
		
	var logIn = function(email) {
		return $http.get('api/user?email=' + email)
		.success(function(user) {
			handleNewlyLoggedInUser(user)
			return user;
		})
		.error(function(error) {
			return {};
		});
	}
	
	var signUp = function(name, email) {
		var userToSave = {userName: name, userEmail: email}
		
		return $http.post('/api/user', userToSave)
		.success(function(user) {
			handleNewlyLoggedInUser(user)
			return user;
		})
		.error(function(error) {
			return {};
		});
	};
	
	function initializeUserAndLoggedInStatus() {
		var userFromCookie = $cookies.getObject(userCookieKey);
		console.log('got user', userFromCookie);
		if (userFromCookie === undefined) {
			loggedIn = false;
			loggedInUser = {}; 
		} else {
			loggedIn = true;
			loggedInUser = userFromCookie; 
		}
	};
	
	function handleNewlyLoggedInUser(user) {
		loggedInUser = user;
		loggedIn = true;
		saveUserToCookie(user);
	};
	
	function saveUserToCookie(user) {
		$cookies.putObject(userCookieKey, user, {expires:cookieExpires});
	};
	
	return {
		getLoggedInUser: getLoggedInUser,
		isLoggedIn: isLoggedIn,
		logIn: logIn,
		signUp: signUp
	};
});