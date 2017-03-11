describe('the recipeService', function () {

	beforeEach(angular.mock.module('recipe'));

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

	describe('the find all recipes in user recipe book', function() {

		var userId = 'theBestUser';

		it('calls the correct endpoint', function() {
			angular.mock.inject(function(recipeService, $httpBackend) {
				$httpBackend.expect('GET', '/api/recipe?recipeBook=' + userId).respond({});
				recipeService.allRecipesInUserBook(userId);
				$httpBackend.verifyNoOutstandingExpectation();
			});
		});

		it('returns a promise with the result of the GET call', function(done) {
			angular.mock.inject(function(recipeService, $httpBackend) {
				var expectedResponse = [{recipeId: '1'}];
				$httpBackend.expect('GET', '/api/recipe?recipeBook=' + userId).respond(expectedResponse);

				recipeService.allRecipesInUserBook(userId)
					.then(function(response){
						expect(response).toEqual(expectedResponse);
					})
					.then(done, done.fail);

				$httpBackend.flush();
			});
		});

		it('returns a catchable error if an error occurs during the GET request', function(done) {
			angular.mock.inject(function(recipeService, $httpBackend) {
				$httpBackend.expect('GET', '/api/recipe?recipeBook=' + userId).respond(500, {message: 'uh-oh'});

				recipeService.allRecipesInUserBook(userId)
					.then(function(){
						done.fail('expected error')
					})
					.catch(function(error) {
						expect(error.data.message).toBe('uh-oh');
						done();
					});

				$httpBackend.flush();
			});
		});
	});
});