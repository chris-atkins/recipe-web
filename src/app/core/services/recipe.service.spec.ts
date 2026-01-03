import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecipeService, Recipe } from './recipe.service';

describe('RecipeService', () => {
  let service: RecipeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecipeService]
    });
    service = TestBed.inject(RecipeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('searchRecipes', () => {
    const searchString = 'find me some food';

    it('calls the correct endpoint with the search string as a query parameter', () => {
      service.searchRecipes(searchString).subscribe();

      const req = httpMock.expectOne('/api/recipe?searchString=find%20me%20some%20food');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('calls the endpoint with no query parameters if no searchString is passed', () => {
      service.searchRecipes().subscribe();

      const req = httpMock.expectOne('/api/recipe');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('returns an observable with the result of the recipe GET call', (done) => {
      const expectedResponse = [{ expected: 'response' }];

      service.searchRecipes(searchString).subscribe(data => {
        expect(data).toEqual(expectedResponse as any);
        done();
      });

      const req = httpMock.expectOne('/api/recipe?searchString=find%20me%20some%20food');
      req.flush(expectedResponse);
    });

    it('when an error is raised during recipe call, it can be caught', (done) => {
      service.searchRecipes().subscribe(
        () => {
          fail('error should have occurred');
        },
        (error) => {
          expect(error.error.message).toEqual('error');
          done();
        }
      );

      const req = httpMock.expectOne('/api/recipe');
      req.flush({ message: 'error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('allRecipesInUserBook', () => {
    const userId = 'theBestUser';

    it('calls the correct endpoint', () => {
      service.allRecipesInUserBook(userId).subscribe();

      const req = httpMock.expectOne('/api/recipe?recipeBook=' + userId);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('returns an observable with the result of the GET call', (done) => {
      const expectedResponse: Recipe[] = [{ recipeId: '1', recipeName: 'Test', recipeContent: 'Content' }];

      service.allRecipesInUserBook(userId).subscribe(response => {
        expect(response).toEqual(expectedResponse);
        done();
      });

      const req = httpMock.expectOne('/api/recipe?recipeBook=' + userId);
      req.flush(expectedResponse);
    });

    it('returns a catchable error if an error occurs during the GET request', (done) => {
      service.allRecipesInUserBook(userId).subscribe(
        () => {
          fail('expected error');
        },
        (error) => {
          expect(error.error.message).toBe('uh-oh');
          done();
        }
      );

      const req = httpMock.expectOne('/api/recipe?recipeBook=' + userId);
      req.flush({ message: 'uh-oh' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('findRecipe', () => {
    const recipeId = '1234567890';

    it('calls the correct endpoint', () => {
      service.findRecipe(recipeId).subscribe();

      const req = httpMock.expectOne('/api/recipe/' + recipeId);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('returns an observable with the result of the GET call', (done) => {
      const expectedResponse: Recipe = { recipeId: '1', recipeName: 'name', recipeContent: 'content' };

      service.findRecipe(recipeId).subscribe(response => {
        expect(response).toEqual(expectedResponse);
        done();
      });

      const req = httpMock.expectOne('/api/recipe/' + recipeId);
      req.flush(expectedResponse);
    });

    it('returns a catchable error if an error occurs during the GET request', (done) => {
      service.findRecipe(recipeId).subscribe(
        () => {
          fail('expected error');
        },
        (error) => {
          expect(error.error.message).toBe('uh-oh');
          done();
        }
      );

      const req = httpMock.expectOne('/api/recipe/' + recipeId);
      req.flush({ message: 'uh-oh' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('saveRecipe', () => {
    const recipe: Recipe = { recipeName: 'name', recipeContent: 'content' };

    it('calls the correct endpoint for new recipe (POST)', () => {
      service.saveRecipe(recipe).subscribe();

      const req = httpMock.expectOne('/api/recipe');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(recipe);
      req.flush(recipe);
    });

    it('calls the correct endpoint for existing recipe (PUT)', () => {
      const existingRecipe: Recipe = { ...recipe, recipeId: '123' };
      service.saveRecipe(existingRecipe).subscribe();

      const req = httpMock.expectOne('/api/recipe/123');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(existingRecipe);
      req.flush(existingRecipe);
    });

    it('returns an observable with the result of the POST call', (done) => {
      const expectedResponse: Recipe = { recipeId: '1', recipeName: 'name', recipeContent: 'content', editable: true };

      service.saveRecipe(recipe).subscribe(response => {
        expect(response).toEqual(expectedResponse);
        done();
      });

      const req = httpMock.expectOne('/api/recipe');
      req.flush(expectedResponse);
    });

    it('returns a catchable error if an error occurs during the POST request', (done) => {
      service.saveRecipe(recipe).subscribe(
        () => {
          fail('expected error');
        },
        (error) => {
          expect(error.error.message).toBe('uh-oh');
          done();
        }
      );

      const req = httpMock.expectOne('/api/recipe');
      req.flush({ message: 'uh-oh' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getRecipeList', () => {
    it('calls the correct endpoint', () => {
      service.getRecipeList().subscribe();

      const req = httpMock.expectOne('/api/recipe');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('returns an observable with the recipe list', (done) => {
      const expectedResponse: Recipe[] = [
        { recipeId: '1', recipeName: 'Recipe 1', recipeContent: 'Content 1' },
        { recipeId: '2', recipeName: 'Recipe 2', recipeContent: 'Content 2' }
      ];

      service.getRecipeList().subscribe(response => {
        expect(response).toEqual(expectedResponse);
        done();
      });

      const req = httpMock.expectOne('/api/recipe');
      req.flush(expectedResponse);
    });
  });
});
