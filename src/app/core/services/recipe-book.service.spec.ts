import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecipeBookService, RecipeBook } from './recipe-book.service';
import { UserService, User } from './user.service';

describe('RecipeBookService', () => {
  let service: RecipeBookService;
  let httpMock: HttpTestingController;
  let userService: UserService;

  const mockUser: User = { userId: '123', userName: 'Test User', userEmail: 'test@test.com' };
  const mockRecipeBook: RecipeBook = [{ recipeId: 'recipe1' }, { recipeId: 'recipe2' }];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecipeBookService, UserService]
    });
    service = TestBed.inject(RecipeBookService);
    httpMock = TestBed.inject(HttpTestingController);
    userService = TestBed.inject(UserService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('getRecipeBook', () => {
    it('should get recipe book for logged in user', (done) => {
      // Log in the user first
      const loginPromise = userService.logIn('test@test.com');
      const loginReq = httpMock.expectOne('/api/user?email=test%40test.com');
      loginReq.flush(mockUser);

      loginPromise.then(() => {
        const getPromise = service.getRecipeBook();
        const req = httpMock.expectOne('/api/user/123/recipe-book');
        expect(req.request.method).toBe('GET');
        req.flush(mockRecipeBook);

        getPromise.then(recipeBook => {
          expect(recipeBook).toEqual(mockRecipeBook);
          done();
        });
      });
    });

    it('should get recipe book for specified user', (done) => {
      const promise = service.getRecipeBook('456');
      const req = httpMock.expectOne('/api/user/456/recipe-book');
      expect(req.request.method).toBe('GET');
      req.flush([{ recipeId: 'recipe3' }]);

      promise.then(recipeBook => {
        expect(recipeBook).toEqual([{ recipeId: 'recipe3' }]);
        done();
      });
    });

    it('should reject when no user is logged in and no userId provided', (done) => {
      // Ensure no user is logged in
      localStorage.clear();
      userService.logOut();

      service.getRecipeBook()
        .then(() => {
          fail('should have rejected');
        })
        .catch(error => {
          expect(error.message).toBe('No user ID available');
          done();
        });
    });
  });

  describe('addToRecipeBook', () => {
    it('should add recipe to book and return updated book', (done) => {
      // Log in the user first
      const loginPromise = userService.logIn('test@test.com');
      const loginReq = httpMock.expectOne('/api/user?email=test%40test.com');
      loginReq.flush(mockUser);

      loginPromise.then(() => {
        const addPromise = service.addToRecipeBook('newRecipe');

        const postReq = httpMock.expectOne('/api/user/123/recipe-book');
        expect(postReq.request.method).toBe('POST');
        expect(postReq.request.body).toEqual({ recipeId: 'newRecipe' });
        postReq.flush({});

        // Wait for the POST to complete before expecting the GET
        setTimeout(() => {
          const getReq = httpMock.expectOne('/api/user/123/recipe-book');
          expect(getReq.request.method).toBe('GET');
          getReq.flush(mockRecipeBook);

          addPromise.then(recipeBook => {
            expect(recipeBook).toEqual(mockRecipeBook);
            done();
          });
        }, 0);
      });
    });

    it('should throw error when user is not logged in', async () => {
      // Ensure no user is logged in
      localStorage.clear();
      userService.logOut();

      try {
        await service.addToRecipeBook('newRecipe');
        fail('should have thrown');
      } catch (error: any) {
        expect(error.message).toBe('User must be logged in');
      }
    });
  });

  describe('removeRecipeFromBook', () => {
    it('should remove recipe from book and return updated book', (done) => {
      // Log in the user first
      const loginPromise = userService.logIn('test@test.com');
      const loginReq = httpMock.expectOne('/api/user?email=test%40test.com');
      loginReq.flush(mockUser);

      loginPromise.then(() => {
        const removePromise = service.removeRecipeFromBook('recipe1');

        const deleteReq = httpMock.expectOne('/api/user/123/recipe-book/recipe1');
        expect(deleteReq.request.method).toBe('DELETE');
        deleteReq.flush({});

        // Wait for the DELETE to complete before expecting the GET
        setTimeout(() => {
          const getReq = httpMock.expectOne('/api/user/123/recipe-book');
          expect(getReq.request.method).toBe('GET');
          getReq.flush([{ recipeId: 'recipe2' }]);

          removePromise.then(recipeBook => {
            expect(recipeBook).toEqual([{ recipeId: 'recipe2' }]);
            done();
          });
        }, 0);
      });
    });

    it('should throw error when user is not logged in', async () => {
      // Ensure no user is logged in
      localStorage.clear();
      userService.logOut();

      try {
        await service.removeRecipeFromBook('recipe1');
        fail('should have thrown');
      } catch (error: any) {
        expect(error.message).toBe('User must be logged in');
      }
    });
  });
});
