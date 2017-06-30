'use strict';

angular.module('recipe')

.directive('imageUpload', function () {
	return {
		replace: false,
		restrict: 'A',
		templateUrl: 'recipe-lib/image-upload/image-upload.html',
		controller: 'imageUploadCtrl',
		scope: {
			imageSavedCallback: '='
		}
	};
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
			url: '/api/image',
			data: {
				file: Upload.dataUrltoBlob(dataUrl, name)
			}
		}).then(function (response) {
			$scope.loading = false;
			$scope.result = JSON.parse(response.data.body);
			$scope.imageSavedCallback($scope.result);
		}, function (error) {
			$scope.loading = false;
			if (error.status > 0)
				$scope.errorMsg = "Error uploading image.";
		});
	};
});

