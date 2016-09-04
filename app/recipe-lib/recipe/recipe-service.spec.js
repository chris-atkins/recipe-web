describe('the recipeService', function () {

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
					done();
				});

				$httpBackend.flush();
			});
		});

		it('when an error is raised during recipe call, it can be caught', function(done) {
			angular.mock.inject(function (recipeService, $httpBackend) {
				$httpBackend.expect('GET', '/api/recipe').respond(500, {message: 'error'});

				var response = recipeService.searchRecipes();

				response.then(function() {
					done.fail('error should have occurred');
				}).catch(function (error) {
					expect(error.data.message).toEqual('error');
					done();
				});

				$httpBackend.flush();
			});
		});
	});
});