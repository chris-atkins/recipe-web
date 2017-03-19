'use strict';

angular.module('recipe')

.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/test', {
		templateUrl: 'recipe-lib/recipe/test.html',
		controller: 'TestCtrl'
	});
}])

.controller('TestCtrl', function ($scope, $routeParams, $http, recipeBookService, userService, recipeService, $location) {

});