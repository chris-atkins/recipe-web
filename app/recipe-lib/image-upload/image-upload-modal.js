'use strict';

angular.module('recipe')

.directive('imageUpload', function () {
	return {
		replace: true,
		restrict: 'E',
		templateUrl: 'recipe-lib/image-upload/image-upload-modal.html',
		controller: 'imageUploadModalCtrl',
		scope: {
			recipe: '=',
			imageSavedCallback: '='
		}
	}
})

.controller('imageUploadModalCtrl', function ($scope, Upload) {

});

