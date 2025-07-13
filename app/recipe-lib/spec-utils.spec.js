'use strict';

/* jshint ignore:start */
var SpecUtils = {};
/* jshint ignore:end */

SpecUtils.buildMockPromiseFunction = function (valueToResolveTo) {
	var valuePromise = SpecUtils.resolvedPromise(valueToResolveTo);
	return jasmine.createSpy('').and.returnValue(valuePromise);
};

SpecUtils.resolvedPromise = function (valueToResolveTo) {
	var valuePromise = {};
	inject(function ($q) {
		var valueDeferred = $q.defer();
		valuePromise = valueDeferred.promise;
		valueDeferred.resolve(valueToResolveTo);
	});
	return valuePromise;
};

/* jshint ignore:start */
SpecUtils.clickElement = function (jqueryObject) {
	var ev = document.createEvent("MouseEvent");
	ev.initMouseEvent(
		"click",
		true /* bubble */, true /* cancelable */,
		window, null,
		0, 0, 0, 0, /* coordinates */
		false, false, false, false, /* modifier keys */
		0 /*left*/, null
	);
	if (jqueryObject[0]) {
		jqueryObject[0].dispatchEvent(ev);
	} else if (jqueryObject.dispatchEvent) {
		$(jqueryObject).dispatchEvent(ev);
	}
};
/* jshint ignore:end */

SpecUtils.loadPage = function(htmlFilePath, scope) {
	angular.mock.inject(function ($templateCache, $compile) {
		setFixtures($templateCache.get(htmlFilePath));

		var doc = angular.element(document);
		var fixture = doc.find('div');

		var elem = angular.element(fixture);
		$compile(elem)(scope);
		scope.$digest();
	});
};

SpecUtils.delayABit = function() {
	var g = 0;
	for (var i = 0; i < 1000; i++) {
		for (var j = 0; j < 1000; j++) {
			g = i * j;
		}
	}
	return g;
};
