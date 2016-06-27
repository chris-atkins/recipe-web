'use strict';

// Declare app level module which depends on views, and components
angular.module('recipe', [
  'ngRoute',
  'ngCookies',
  'recipe.user',
  'recipe.home',
  'recipe.searchRecipes',
  'recipe.newRecipe',
  'recipe.browseAllRecipes',
  'recipe.viewRecipe',
  'myApp.view1',
  'myApp.view2',
  'myApp.version'
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

    function registerRoute(current) {
        if (current !== undefined) {
            lastRoute = current.originalPath;
            lastPathParams = current.pathParams;
        }
        // for (var attribute in current) {
        //     console.log(attribute);
        //     console.log(current[attribute]);
        // }
    }

    function getLastRoute() {
        return lastRoute;
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


