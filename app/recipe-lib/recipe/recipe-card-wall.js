'use strict';

angular.module('recipe')

.directive('recipeCardWall', function () {
	return {
		replace: false,
		restrict: 'A',
		templateUrl: 'recipe-lib/recipe/recipe-card-wall.html',
		controller: 'recipeCardWallCtrl',
		scope: {
			recipeList: '=',
			recipeBook: '=',
			recipeBookMode: '@',
			owningUserId: '@',
			recipeRemovalCallback: '='
		}
	}
})

.controller('recipeCardWallCtrl', function ($scope, $location, recipeBookService, userService, _) {

	//$scope.recipeList: '=',
	//$scope.recipeBook: '=',
	//$scope.recipeBookMode: '@',
	//$scope.owningUserId: '@',
	//$scope.recipeRemovalCallback: '='
});
