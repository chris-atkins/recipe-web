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
        	
			console.log('IM HERE');
			console.log('config', config);
			console.log(userService);
			console.log('user', userService.getLoggedInUser());
			
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
}]);


