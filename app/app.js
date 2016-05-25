'use strict';

// Declare app level module which depends on views, and components
angular.module('recipe', [
  'ngRoute',
  'recipe.user',
  'recipe.home',
  'recipe.searchRecipes',
  'recipe.newRecipe',
  'recipe.browseAllRecipes',
  'recipe.viewRecipe',
  'myApp.view1',
  'myApp.view2',
  'myApp.version'
]).
config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({redirectTo: '/home'});
}]);
