'use strict';

var SpecUtils = {};

SpecUtils.buildMockPromiseFunction = function(valueToResolveTo) {
	var valuePromise = SpecUtils.resolvedPromise(valueToResolveTo);
	return jasmine.createSpy('').and.returnValue(valuePromise);
};

SpecUtils.resolvedPromise = function(valueToResolveTo) {
	var valuePromise = {};
	inject(function ($q) {
		var valueDeferred = $q.defer();
		valuePromise = valueDeferred.promise;
		valueDeferred.resolve(valueToResolveTo);
	});
	return valuePromise;
};