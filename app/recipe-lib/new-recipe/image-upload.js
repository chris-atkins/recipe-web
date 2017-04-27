'use strict';

angular.module('recipe')

.directive('imageUpload', function () {
	return {
		replace: false,
		restrict: 'A',
		templateUrl: 'recipe-lib/new-recipe/image-upload.html',
		controller: 'imageUploadCtrl',
		scope: {
			recipe: '=',
			imageSavedCallback: '='
		}
	}
})

.controller('imageUploadCtrl', function ($scope, Upload) {
	$scope.loading = false;
	$scope.processing = false;

	$scope.startProcessing = function(){
		$scope.processing = true;
	};

	$scope.$watch('croppedDataUrl', function() {
		$scope.processing = false;
	});

	$scope.upload = function (dataUrl, name) {
		$scope.loading = true;
		Upload.upload({
			url: '/api/recipe/' + $scope.recipe.recipeId + '/image',
			data: {
				file: Upload.dataUrltoBlob(dataUrl, name)
			}
		}).then(function (response) {
			$scope.loading = false;
			$scope.result = response.data;
			$scope.imageSavedCallback($scope.result);
		}, function (error) {
			$scope.loading = false;
			if (error.status > 0)
				$scope.errorMsg = "Error uploading image.";
		});
	}
});

