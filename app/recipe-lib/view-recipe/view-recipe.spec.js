'use strict';

describe('the view recipe controller', function() {

	var scope;
	var controller;
	
	
	beforeEach(inject(function ($controller, $rootScope, $compile) {
		scope = $rootScope.$new();
		compile = $compile;
		MainCtrl = $controller('myCtrl', {
			$scope: scope
		});
	}));

	it('should set the div content to "' + scope.text + '"', function(){
		var html = '<div id="text">{{ text }}</div>';
		elem = angular.element(html);  // turn html into an element object
		compile(elem)(scope); // compile the html
		scope.$digest();  // update the scope
		expect(elem.text()).toBe(scope.text);  //test to see if it was updated.
	});
});