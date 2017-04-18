'use strict';

angular.module('recipe')

.directive('imageUpload', function () {
	return {
		replace: false,
		restrict: 'A',
		templateUrl: 'recipe-lib/new-recipe/image-upload.html',
		controller: 'imageUploadCtrl',
		scope: {
			recipe: '='
		}
	}
})

.controller('imageUploadCtrl', function ($scope, Upload, $timeout) {

	$scope.upload = function (dataUrl, name) {
		Upload.upload({
			url: '/api/recipe/' + $scope.recipe.recipeId + '/image',
			data: {
				file: Upload.dataUrltoBlob(dataUrl, name)
			}
		}).then(function (response) {
				$scope.result = response.data;
		}, function (error) {
			if (error.status > 0)
				$scope.errorMsg = error.status + ': ' + error.data;
		});
	}
});

