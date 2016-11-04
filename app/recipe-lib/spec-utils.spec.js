'use strict';

var SpecUtils = {};

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

SpecUtils.clickElement = function (jqueryObject) {
	/* jshint ignore:start */
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
	/* jshint ignore:end */
};