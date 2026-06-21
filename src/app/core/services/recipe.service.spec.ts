import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecipeService, Recipe, RecipeCardView } from './recipe.service';

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

  // Shared assertion: the synthetic rating is present and well-shaped.
  // (category/tags are real now — asserted per-test where flushed.)
  function expectDecorated(view: RecipeCardView): void {
    expect(view.rating).toBeTruthy();
    expect(view.rating.average).toBeGreaterThanOrEqual(3.5);
    expect(view.rating.average).toBeLessThanOrEqual(5);
    expect(Math.round(view.rating.average * 10) / 10).toBe(view.rating.average); // one decimal
    expect(Number.isInteger(view.rating.count)).toBe(true);
    expect(view.rating.count).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(view.tags)).toBe(true);
  }

  describe('searchRecipes', () => {
    const searchString = 'find me some food';

    it('calls the correct endpoint with the search string as a query parameter', () => {
      service.searchRecipes(searchString);

      const req = httpMock.expectOne('/api/recipe?searchString=find%20me%20some%20food');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('calls the endpoint with no query parameters if no searchString is passed', () => {
      service.searchRecipes();

      const req = httpMock.expectOne('/api/recipe');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('passes the real recipe fields through verbatim and adds the synthetic display fields', (done) => {
      const realRecipe: Recipe = {
        recipeId: 'abc123', recipeName: 'Real Recipe', recipeContent: 'Real Content',
        imageUrl: 'http://img/1.png', editable: true, category: 'Dessert', tags: ['Vegan']
      };

      const promise = service.searchRecipes(searchString);
      const req = httpMock.expectOne('/api/recipe?searchString=find%20me%20some%20food');
      req.flush([realRecipe]);

      promise.then(data => {
        expect(data.length).toBe(1);
        // real fields untouched
        expect(data[0].recipeId).toBe('abc123');
        expect(data[0].recipeName).toBe('Real Recipe');
        expect(data[0].recipeContent).toBe('Real Content');
        expect(data[0].imageUrl).toBe('http://img/1.png');
        expect(data[0].editable).toBe(true);
        // real category + tags pass through (no longer synthesized)
        expect(data[0].category).toBe('Dessert');
        expect(data[0].tags).toEqual(['Vegan']);
        // synthetic fields added
        expectDecorated(data[0]);
        done();
      });
    });

    it('when an error is raised during recipe call, it can be caught', (done) => {
      const promise = service.searchRecipes();
      const req = httpMock.expectOne('/api/recipe');
      req.flush({ message: 'error' }, { status: 500, statusText: 'Server Error' });

      promise
        .then(() => {
          fail('error should have occurred');
        })
        .catch((error) => {
          expect(error.error.message).toEqual('error');
          done();
        });
    });
  });

  describe('allRecipesInUserBook', () => {
    const userId = 'theBestUser';

    it('calls the correct endpoint', () => {
      service.allRecipesInUserBook(userId);

      const req = httpMock.expectOne('/api/recipe?recipeBook=' + userId);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('returns decorated recipes that preserve the real fields', (done) => {
      const realRecipe: Recipe = { recipeId: '1', recipeName: 'Test', recipeContent: 'Content' };

      const promise = service.allRecipesInUserBook(userId);
      const req = httpMock.expectOne('/api/recipe?recipeBook=' + userId);
      req.flush([realRecipe]);

      promise.then(response => {
        expect(response.length).toBe(1);
        expect(response[0].recipeId).toBe('1');
        expect(response[0].recipeName).toBe('Test');
        expect(response[0].recipeContent).toBe('Content');
        expectDecorated(response[0]);
        done();
      });
    });

    it('returns a catchable error if an error occurs during the GET request', (done) => {
      const promise = service.allRecipesInUserBook(userId);
      const req = httpMock.expectOne('/api/recipe?recipeBook=' + userId);
      req.flush({ message: 'uh-oh' }, { status: 500, statusText: 'Server Error' });

      promise
        .then(() => {
          fail('expected error');
        })
        .catch((error) => {
          expect(error.error.message).toBe('uh-oh');
          done();
        });
    });
  });

  describe('getRecipeList', () => {
    it('calls the correct endpoint', () => {
      service.getRecipeList();

      const req = httpMock.expectOne('/api/recipe');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('returns the decorated recipe list preserving real fields', (done) => {
      const realRecipes: Recipe[] = [
        { recipeId: '1', recipeName: 'Recipe 1', recipeContent: 'Content 1' },
        { recipeId: '2', recipeName: 'Recipe 2', recipeContent: 'Content 2' }
      ];

      const promise = service.getRecipeList();
      const req = httpMock.expectOne('/api/recipe');
      req.flush(realRecipes);

      promise.then(response => {
        expect(response.length).toBe(2);
        expect(response[0].recipeName).toBe('Recipe 1');
        expect(response[1].recipeName).toBe('Recipe 2');
        response.forEach(expectDecorated);
        done();
      });
    });
  });

  describe('synthetic fake-data decoration (read path)', () => {
    it('returns an empty array for an empty response without crashing', (done) => {
      const promise = service.getRecipeList();
      httpMock.expectOne('/api/recipe').flush([]);

      promise.then(response => {
        expect(response).toEqual([]);
        done();
      });
    });

    it('keeps every rating within [3.5, 5] with one decimal and an integer count', (done) => {
      const many: Recipe[] = [];
      for (let i = 0; i < 50; i++) {
        many.push({ recipeId: 'id' + i, recipeName: 'R' + i, recipeContent: 'C' });
      }

      const promise = service.getRecipeList();
      httpMock.expectOne('/api/recipe').flush(many);

      promise.then(response => {
        expect(response.length).toBe(50);
        response.forEach(expectDecorated);
        done();
      });
    });

    it('passes real category and tags through unchanged', (done) => {
      const recipe: Recipe = { recipeId: 'c1', recipeName: 'X', recipeContent: 'Y', category: 'Soup', tags: ['Comfort Food', 'Vegan'] };

      const promise = service.getRecipeList();
      httpMock.expectOne('/api/recipe').flush([recipe]);

      promise.then(response => {
        expect(response[0].category).toBe('Soup');
        expect(response[0].tags).toEqual(['Comfort Food', 'Vegan']);
        done();
      });
    });

    it('defaults missing tags to an empty array', (done) => {
      const recipe: Recipe = { recipeId: 'c2', recipeName: 'X', recipeContent: 'Y' };

      const promise = service.getRecipeList();
      httpMock.expectOne('/api/recipe').flush([recipe]);

      promise.then(response => {
        expect(response[0].tags).toEqual([]);
        done();
      });
    });

    it('still decorates a recipe with no recipeId (falls back without throwing)', (done) => {
      const promise = service.getRecipeList();
      httpMock.expectOne('/api/recipe').flush([{ recipeName: 'No Id', recipeContent: 'C' } as Recipe]);

      promise.then(response => {
        expectDecorated(response[0]);
        done();
      });
    });

    it('computes the lower rating bound when the RNG returns its minimum', (done) => {
      spyOn(service as any, 'nextRandom').and.returnValues(0, 0);

      const promise = service.getRecipeList();
      httpMock.expectOne('/api/recipe').flush([{ recipeId: '1', recipeName: 'R', recipeContent: 'C' }]);

      promise.then(response => {
        expect(response[0].rating.average).toBe(3.5);
        expect(response[0].rating.count).toBe(5);
        done();
      });
    });

    it('computes the upper rating bound when the RNG returns near its maximum', (done) => {
      spyOn(service as any, 'nextRandom').and.returnValues(0.999999, 0.999999);

      const promise = service.getRecipeList();
      httpMock.expectOne('/api/recipe').flush([{ recipeId: '1', recipeName: 'R', recipeContent: 'C' }]);

      promise.then(response => {
        expect(response[0].rating.average).toBe(5);
        expect(response[0].rating.count).toBe(300);
        done();
      });
    });

    it('rounds the rating average to a single decimal place', (done) => {
      spyOn(service as any, 'nextRandom').and.returnValue(0.5);

      const promise = service.getRecipeList();
      httpMock.expectOne('/api/recipe').flush([{ recipeId: '1', recipeName: 'R', recipeContent: 'C' }]);

      promise.then(response => {
        expect(response[0].rating.average).toBe(4.3); // round((3.5 + 0.5 * 1.5) * 10) / 10
        done();
      });
    });

    it('adds faked preview stats with valid shapes', (done) => {
      const promise = service.getRecipeList();
      httpMock.expectOne('/api/recipe').flush([{ recipeId: 'stats1', recipeName: 'R', recipeContent: 'C' }]);

      promise.then(response => {
        const r = response[0];
        expect(Number.isInteger(r.calories)).toBe(true);
        expect(r.calories).toBeGreaterThan(0);
        expect(r.activeTimeMinutes).toBeGreaterThan(0);
        expect(r.totalTimeMinutes).toBeGreaterThanOrEqual(r.activeTimeMinutes);
        expect(r.servings).toBeGreaterThan(0);
        done();
      });
    });

    it('assigns preview stats deterministically for the same recipeId', (done) => {
      const recipe = { recipeId: 'det-stats', recipeName: 'X', recipeContent: 'Y' };

      const firstPromise = service.getRecipeList();
      httpMock.expectOne('/api/recipe').flush([recipe]);

      firstPromise.then(first => {
        const secondPromise = service.getRecipeList();
        httpMock.expectOne('/api/recipe').flush([recipe]);

        secondPromise.then(second => {
          expect(second[0].calories).toBe(first[0].calories);
          expect(second[0].activeTimeMinutes).toBe(first[0].activeTimeMinutes);
          expect(second[0].totalTimeMinutes).toBe(first[0].totalTimeMinutes);
          expect(second[0].servings).toBe(first[0].servings);
          done();
        });
      });
    });
  });

  describe('findRecipe (canonical read — must stay un-decorated)', () => {
    const recipeId = '1234567890';

    it('calls the correct endpoint', () => {
      service.findRecipe(recipeId);

      const req = httpMock.expectOne('/api/recipe/' + recipeId);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('returns the exact backend recipe with no synthetic fields added', (done) => {
      const expectedResponse: Recipe = { recipeId: '1', recipeName: 'name', recipeContent: 'content' };

      const promise = service.findRecipe(recipeId);
      const req = httpMock.expectOne('/api/recipe/' + recipeId);
      req.flush(expectedResponse);

      promise.then(response => {
        expect(response).toEqual(expectedResponse);
        expect((response as any).rating).toBeUndefined();
        done();
      });
    });

    it('returns a catchable error if an error occurs during the GET request', (done) => {
      const promise = service.findRecipe(recipeId);
      const req = httpMock.expectOne('/api/recipe/' + recipeId);
      req.flush({ message: 'uh-oh' }, { status: 500, statusText: 'Server Error' });

      promise
        .then(() => {
          fail('expected error');
        })
        .catch((error) => {
          expect(error.error.message).toBe('uh-oh');
          done();
        });
    });
  });

  describe('saveRecipe (write path — must never carry synthetic fields)', () => {
    const recipe: Recipe = { recipeName: 'name', recipeContent: 'content' };

    it('calls the correct endpoint for new recipe (POST) and sends no synthetic rating', () => {
      service.saveRecipe(recipe);

      const req = httpMock.expectOne('/api/recipe');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(recipe);
      expect((req.request.body as any).rating).toBeUndefined();
      req.flush(recipe);
    });

    it('sends real category and tags in the save payload when present', () => {
      const withAttrs: Recipe = { recipeName: 'n', recipeContent: 'c', category: 'Main Dish', tags: ['Spicy'] };
      service.saveRecipe(withAttrs);

      const req = httpMock.expectOne('/api/recipe');
      expect(req.request.body.category).toBe('Main Dish');
      expect(req.request.body.tags).toEqual(['Spicy']);
      req.flush(withAttrs);
    });

    it('calls the correct endpoint for existing recipe (PUT)', () => {
      const existingRecipe: Recipe = { ...recipe, recipeId: '123' };
      service.saveRecipe(existingRecipe);

      const req = httpMock.expectOne('/api/recipe/123');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(existingRecipe);
      req.flush(existingRecipe);
    });

    it('returns a promise with the result of the POST call', (done) => {
      const expectedResponse: Recipe = { recipeId: '1', recipeName: 'name', recipeContent: 'content', editable: true };

      const promise = service.saveRecipe(recipe);
      const req = httpMock.expectOne('/api/recipe');
      req.flush(expectedResponse);

      promise.then(response => {
        expect(response).toEqual(expectedResponse);
        done();
      });
    });

    it('returns a catchable error if an error occurs during the POST request', (done) => {
      const promise = service.saveRecipe(recipe);
      const req = httpMock.expectOne('/api/recipe');
      req.flush({ message: 'uh-oh' }, { status: 500, statusText: 'Server Error' });

      promise
        .then(() => {
          fail('expected error');
        })
        .catch((error) => {
          expect(error.error.message).toBe('uh-oh');
          done();
        });
    });
  });
});
