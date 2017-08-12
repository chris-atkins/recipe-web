'use strict';

angular.module('recipe')

.controller('NavbarCtrl', function ($scope, $http, userService, $location, externalNavigationService) {

	var loginHasBeenAttempted = false;

	$scope.user = userService.getLoggedInUser();
	$scope.isLoggedIn = userService.isLoggedIn();
	$scope.loginMessage = buildLoginMessage();

	$scope.loginVisible = false;
	$scope.logoutVisible = false;
	$scope.name = '';
	$scope.email = '';

	$scope.alertVisible = false;

	handleExternalLoginIfUserIsAttemptingOne();

	$scope.isAlertVisible = function () {
		return $scope.alertVisible;
	};
	$scope.setAlertVisible = function (value) {
		$scope.alertVisible = value;
		// $scope.$digest();
	};

	$scope.navigateHome = function () {
		$location.url('/home');
	};

	$scope.navigateBrowse = function () {
		$location.url('/search-recipes');
	};

	$scope.navigateSave = function () {
		if (userService.isLoggedIn()) {
			$location.url('/new-recipe');
		} else {
			$scope.setAlertVisible(true);
		}
	};

	$scope.navigateRecipeBook = function () {
		if (userService.isLoggedIn()) {
			$location.url('/user/' + userService.getLoggedInUser().userId + '/recipe-book');
		} else {
			$scope.setAlertVisible(true);
		}
	};

	$scope.loginClicked = function () {
		$scope.setAlertVisible(false);
	};

	$scope.googleAuthClicked = function () {
		externalNavigationService.navigateTo('/auth/google?callbackPath=' + $location.path());
	};

	$scope.logIn = function ($event) {
		$event.stopImmediatePropagation();
		var target = $event.target;
		loginHasBeenAttempted = true;
		userService.logIn($scope.email).then(function () {
			updateUserStatus();
			if ($scope.isLoggedIn) {
				target.parentElement.click();
			}
		});
	};

	$scope.signUp = function () {
		userService.signUp($scope.name, $scope.email).then(function () {
			updateUserStatus();
		});
	};

	$scope.logOut = function () {
		userService.logOut();
		updateUserStatus();
		resetLogin();
	};

	$scope.shouldShowLogIn = function () {
		return !$scope.isLoggedIn && !loginHasBeenAttempted;
	};

	$scope.shouldShowSignUp = function () {
		return !$scope.isLoggedIn && loginHasBeenAttempted;
	};

	function buildLoginMessage() {
		if ($scope.user && $scope.user.userId) {
			return 'Welcome, ' + $scope.user.userName;
		} else {
			return 'Log In';
		}
	}

	function updateUserStatus() {
		$scope.user = userService.getLoggedInUser();
		$scope.isLoggedIn = userService.isLoggedIn();
		$scope.loginMessage = buildLoginMessage();
	}

	function resetLogin() {
		$scope.loginVisible = false;
		$scope.logoutVisible = false;
		loginHasBeenAttempted = false;
	}

	function handleExternalLoginIfUserIsAttemptingOne() {
		if (userService.isExternalLoginBeingAttempted()) {
			userService.performExternalLogin().then(function () {
				updateUserStatus();
			});
		}
	}
});