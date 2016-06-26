'use strict';

angular.module('recipe.newRecipe', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/new-recipe', {
            templateUrl: 'new-recipe/new-recipe.html',
            controller: 'NewRecipeCtrl'
        });
    }])

    .controller('NewRecipeCtrl', function ($scope, $http, $location, userService) {

        $scope.newRecipeName = '';
        $scope.newRecipeContent = '';
        var attemptedToSaveWithNoLogin = false;

        $scope.saveRecipeAndNavigate = function () {
            if (isNotLoggedIn()) {
                attemptedToSaveWithNoLogin = true;
                return;
            } else {
                saveRecipe()
                    .then(function(response) {
                        $location.path('/view-recipe/' + response.data.recipeId);
                    });
            }
        };

        $scope.shouldShowErrorMessage = function () {
            return attemptedToSaveWithNoLogin  && isNotLoggedIn();
        };

        function isNotLoggedIn() {
            return !userService.isLoggedIn();
        }

        function saveRecipe() {
            var recipeToSave = {
                recipeName: $scope.newRecipeName,
                recipeContent: $scope.newRecipeContent
            };

            return $http.post('/api/recipe', recipeToSave)
                .success(function (recipe) {
                    return recipe;
                })
                .error(function (error) {
                    console.log('failure saving recipe:', error);
                });
        }
    });