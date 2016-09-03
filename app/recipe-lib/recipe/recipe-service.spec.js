fdescribe('the recipeService', function () {

	beforeEach(angular.mock.module('recipe.recipe.service'));

	describe('the searchRecipe function', function () {

		var searchString = 'find me some food';

		it('calls the correct endpoint with the search string as a query parameter', function() {
			angular.mock.inject(function (recipeService, $httpBackend) {
				$httpBackend.expect('GET', '/api/recipe?searchString=' + searchString).respond({});
				recipeService.searchRecipes(searchString);
				$httpBackend.verifyNoOutstandingExpectation();
			})
		});

		it('calls the endpoint with no query parameters if no searchString is passed', function() {
			angular.mock.inject(function (recipeService, $httpBackend) {
				$httpBackend.expect('GET', '/api/recipe').respond({});
				recipeService.searchRecipes();
				$httpBackend.verifyNoOutstandingExpectation();
			})
		});

		it('returns a promise with the result of the recipe GET call', function(done) {
			angular.mock.inject(function (recipeService, $httpBackend) {
				var expectedResponse = {expected: 'response'};
				$httpBackend.expect('GET', '/api/recipe?searchString=' + searchString).respond(expectedResponse);

				var response = recipeService.searchRecipes(searchString);

				response.then(function (data) {
					expect(data).toEqual(expectedResponse);
					console.log('finished expecting things');
					done();
				});

				$httpBackend.flush();
			});
		});
	});
});