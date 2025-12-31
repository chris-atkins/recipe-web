'use strict';

/* jshint ignore:start */
window.SpecUtils = {};
/* jshint ignore:end */

SpecUtils.buildMockPromiseFunction = function (valueToResolveTo) {
	var valuePromise = SpecUtils.resolvedPromise(valueToResolveTo);
	return jasmine.createSpy('').and.returnValue(valuePromise);
};

SpecUtils.resolvedPromise = function (valueToResolveTo) {
	var valuePromise = {};
	inject(function ($q) {
		valuePromise = $q.resolve(valueToResolveTo);
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

SpecUtils.delayABit = async function(milliseconds) {
	const millis = milliseconds || 500;
	return new Promise(resolve => setTimeout(resolve, millis));
};

SpecUtils.waitForElement = async function(selector, timeout) {
	timeout = timeout || 3000;
	var startTime = Date.now();
	var pollInterval = 50;

	while (Date.now() - startTime < timeout) {
		var element = $(selector);
		if (element.length > 0 && element.is(':visible')) {
			return true;
		}
		await SpecUtils.delayABit(pollInterval);
	}
	return false;
};

SpecUtils.waitForAngular = async function(scope) {
	await SpecUtils.delayABit(200);
	if (scope) {
		scope.$digest();
	}
	await SpecUtils.delayABit(200);
};

SpecUtils.removeModalBackdrop = async function() {
	var back = $('.modal-backdrop');
	await back.remove();
};
