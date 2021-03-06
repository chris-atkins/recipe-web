'use strict';

angular.module('recipe', [
	'ngRoute',
	'ngCookies',
	'underscore',
	'angularTrix',
	'myApp.view1',
	'myApp.view2',
	'myApp.version',
	'ngFileUpload',
	'ngImgCrop',
	'angular-clipboard'
])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({redirectTo: '/home'});
}])

.factory('userHeaderInjector', ['$injector', function($injector) {  
    var injector = {
        request: function(config) {
        	var userService = $injector.get('userService');
			
			var user = userService.getLoggedInUser();
			if (user) {
				config.headers.RequestingUser = user.userId;				
			}
            return config;
        }
    };
    return injector;
}])
.config(['$httpProvider', function($httpProvider) {  
    $httpProvider.interceptors.push('userHeaderInjector');
}])

.factory('routeHistory', function() {

    var lastRoute;
    var lastPathParams;
    var lastQueryParams;

    function registerRoute(current) {
        if (current !== undefined) {
            lastRoute = current.originalPath;
            lastPathParams = current.pathParams;
            lastQueryParams = current.params;
        }
    }

    function getLastRoute() {
		var lastRouteWithPathParams = processWithPathParams();

        if(useQueryParams()) {
            return lastRouteWithPathParams + buildQueryParamString();
        }
        return lastRouteWithPathParams;
    }

	function processWithPathParams() {
		var pathWithParams = lastRoute;
		for (var param in lastPathParams) {
			var stringToReplace = ':' + param;
			pathWithParams = pathWithParams.replace(stringToReplace, lastPathParams[param]);
		}
		return pathWithParams;
	}

    function useQueryParams() {
        return lastQueryParams !== undefined && lastQueryParams.searchFor !== undefined;
    }

    function buildQueryParamString() {
        return '?searchFor=' + lastQueryParams.searchFor;
    }

    return {
        registerRoute: registerRoute,
        getLastRoute: getLastRoute
    };
})
.run(function($rootScope, routeHistory) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        routeHistory.registerRoute(current);
    });
});


