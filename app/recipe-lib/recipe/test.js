'use strict';

angular.module('recipe')

.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/test', {
		templateUrl: 'recipe-lib/recipe/test.html',
		controller: 'TestCtrl'
	});
}])

.controller('TestCtrl', function ($scope, Upload, $timeout) {

	//inject ngFileUpload and ngImgCrop directives and services.
	// var app = angular.module('fileUpload', ['ngFileUpload', 'ngImgCrop']);

	$scope.upload = function (dataUrl, name) {
		Upload.upload({
			url: 'http://localhost:8000/api/recipe/1234/image',
			data: {
				file: Upload.dataUrltoBlob(dataUrl, name)
			}
		}).then(function (response) {
			$timeout(function () {
				$scope.result = response.data;
			});
		}, function (response) {
			if (response.status > 0) $scope.errorMsg = response.status
				+ ': ' + response.data;
		}, function (evt) {
			$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
		});
	}

});