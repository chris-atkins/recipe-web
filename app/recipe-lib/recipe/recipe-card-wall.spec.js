
describe('the recipe-card-wall module', function() {

	var parentScope, recipeScope;
	
	var recipeBookMode = 'false';
	var owningUserId = 'userId1'
	var recipeRemovalCallback = function() {console.log('hi');};

	var recipe1 = {
		recipeId: 'id1',
		recipeName: 'name1',
		recipeContent: 'content1',
		editable: true
	};
	var recipe2 = {
		recipeId: 'id2',
		recipeName: 'name2',
		recipeContent: 'content2',
		editable: false
	};

	var recipeList = [recipe1, recipe2];
	var recipeBook = ['bookId1', 'bookId2'];

	beforeEach(angular.mock.module('recipe', 'my.templates'));

	function buildControllerWithRecipeListAndBook(recipeList, recipeBook) {
		angular.module('recipe')
		.controller('recipeCardWallTestController', function ($scope) {
			$scope.recipeList = recipeList;
			$scope.recipeBook = recipeBook;
			$scope.recipeBookMode = recipeBookMode;
			$scope.owningUserId = owningUserId;
			$scope.recipeRemovalCallback = recipeRemovalCallback;
		});
	}

	var fixture =
		'<div ngController="recipeCardWallTestController">' +
		'     <div recipe-card-wall recipe-list="recipeList" recipe-book="recipeBook" recipe-book-mode="{{recipeBookMode}}" owning-user-id="{{owningUserId}}" recipe-removal-callback="recipeRemovalCallback" class="recipe-card-wall"></div>' +
		'</div>';

	function setupRecipeCardWallController() {
		angular.mock.inject(function ($controller, $rootScope) {
			parentScope = $rootScope.$new();

			$controller('recipeCardWallTestController', {
				$scope: parentScope
			});
		});
	}

	function renderFixture() {
		angular.mock.inject(function ($controller, $rootScope, $compile) {
			var fixture = angular.element(document).find('div');
			var elem = angular.element(fixture);

			$compile(elem)(parentScope);
			$rootScope.$digest();
		});
	}


	beforeEach(function () {
		buildControllerWithRecipeListAndBook(recipeList, recipeBook);
		setupRecipeCardWallController();
		setFixtures(fixture);
		renderFixture('singleRecipeTestController');
	});

	it('shows a recipe for each recipe in the recipe list', function() {
		var recipe1 = $('#id1');
		var recipe2 = $('#id2');
		expect(recipe1.length).toBe(1);
		expect(recipe2.length).toBe(1);
	});

	it('correctly passes down the right parameters to the child recipes', function() {
		recipeScope = parentScope.$$childHead.$$childHead;

		expect(recipeScope.recipe).toEqual(recipe1);
		expect(recipeScope.recipeBook).toEqual(recipeBook);
		expect(recipeScope.recipeBookMode ).toEqual(recipeBookMode);
		expect(recipeScope.owningUserId ).toEqual(owningUserId);
		expect(recipeScope.recipeRemovalCallback).toEqual(recipeRemovalCallback);
	});
});