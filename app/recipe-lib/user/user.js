'use strict';

angular.module('recipe')

.factory('userService', function ($http, $cookies) {

	var userCookieKey = 'myrecipeconnection.com.usersLoggedInFromThisBrowser';
	var now = new Date();
	var cookieExpires = new Date(now.getFullYear() + 100, now.getMonth(), now.getDate());

	var loggedIn;
	var loggedInUser;

	initializeUserAndLoggedInStatus();

	var isLoggedIn = function () {
		return loggedIn;
	};

	var getLoggedInUser = function () {
		return loggedInUser;
	};

	var logIn = function (email) {
		return $http.get('api/user?email=' + email)
		.success(function (user) {
			handleNewlyLoggedInUser(user);
			return user;
		})
		.error(function () {
			return {};
		});
	};

	var signUp = function (name, email) {
		var userToSave = {userName: name, userEmail: email};

		return $http.post('/api/user', userToSave)
		.success(function (user) {
			handleNewlyLoggedInUser(user);
			return user;
		})
		.error(function () {
			return {};
		});
	};

	var logOut = function () {
		$cookies.remove(userCookieKey);
		loggedInUser = {};
		loggedIn = false;
	};

	function initializeUserAndLoggedInStatus() {
		var userFromCookie = $cookies.getObject(userCookieKey);
		if (userFromCookie === undefined) {
			loggedIn = false;
			loggedInUser = {};
		} else {
			loggedIn = true;
			loggedInUser = userFromCookie;
		}
	}

	function handleNewlyLoggedInUser(user) {
		loggedInUser = user;
		loggedIn = true;
		saveUserToCookie(user);
	}

	function saveUserToCookie(user) {
		$cookies.putObject(userCookieKey, user, {expires: cookieExpires});
	}

	var doesCookieExistForExternalLogin = function () {
		var googleAuthUser = $cookies.getObject('RecipeConnectionGoogleAuth');
		return googleAuthUser !== undefined;
	};

	var performExternalLogin = function () {
		var googleAuthUser = $cookies.getObject('RecipeConnectionGoogleAuth');
		if (googleAuthUser === undefined) {
			return {};
		}
		return googleLogIn(googleAuthUser.userName, googleAuthUser.userEmail);
	};

	function googleLogIn(name, email) {
		return $http.get('/api/user?email=' + email)
		.then(function (user) {
			handleNewlyLoggedInUser(user.data);
			return user;
		})
		.catch(function () {
			return signUp(name, email);
		});
	}

	return {
		getLoggedInUser: getLoggedInUser,
		isLoggedIn: isLoggedIn,
		logIn: logIn,
		signUp: signUp,
		logOut: logOut,
		isExternalLoginBeingAttempted: doesCookieExistForExternalLogin,
		performExternalLogin: performExternalLogin
	};
});