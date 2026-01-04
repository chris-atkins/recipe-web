import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecipeBookService, RecipeBook } from './recipe-book.service';
import { UserService, User } from './user.service';

describe('RecipeBookService', () => {
  let service: RecipeBookService;
  let httpMock: HttpTestingController;
  let userService: UserService;

  const mockUser: User = { userId: '123', userName: 'Test User', userEmail: 'test@test.com' };
  const mockRecipeBook: RecipeBook = { userId: '123', recipes: ['recipe1', 'recipe2'] };

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
      userService.logIn('test@test.com').subscribe(() => {
        service.getRecipeBook().subscribe(recipeBook => {
          expect(recipeBook).toEqual(mockRecipeBook);
          done();
        });

        const req = httpMock.expectOne('/api/user/123/recipe-book');
        expect(req.request.method).toBe('GET');
        req.flush(mockRecipeBook);
      });

      const loginReq = httpMock.expectOne('/api/user?email=test%40test.com');
      loginReq.flush(mockUser);
    });

    it('should get recipe book for specified user', (done) => {
      service.getRecipeBook('456').subscribe(recipeBook => {
        expect(recipeBook).toEqual({ userId: '456', recipes: ['recipe3'] });
        done();
      });

      const req = httpMock.expectOne('/api/user/456/recipe-book');
      expect(req.request.method).toBe('GET');
      req.flush({ userId: '456', recipes: ['recipe3'] });
    });

    it('should throw error when no user is logged in and no userId provided', () => {
      // Ensure no user is logged in
      localStorage.clear();
      userService.logOut();

      expect(() => {
        service.getRecipeBook();
      }).toThrowError('No user ID available');
    });
  });

  describe('addToRecipeBook', () => {
    it('should add recipe to book and return updated book', (done) => {
      // Log in the user first
      userService.logIn('test@test.com').subscribe(() => {
        service.addToRecipeBook('newRecipe').subscribe(recipeBook => {
          expect(recipeBook).toEqual(mockRecipeBook);
          done();
        });

        const postReq = httpMock.expectOne('/api/user/123/recipe-book');
        expect(postReq.request.method).toBe('POST');
        expect(postReq.request.body).toEqual({ recipeId: 'newRecipe' });
        postReq.flush({});

        const getReq = httpMock.expectOne('/api/user/123/recipe-book');
        expect(getReq.request.method).toBe('GET');
        getReq.flush(mockRecipeBook);
      });

      const loginReq = httpMock.expectOne('/api/user?email=test%40test.com');
      loginReq.flush(mockUser);
    });

    it('should throw error when user is not logged in', () => {
      // Ensure no user is logged in
      localStorage.clear();
      userService.logOut();

      expect(() => service.addToRecipeBook('newRecipe')).toThrowError('User must be logged in');
    });
  });

  describe('removeRecipeFromBook', () => {
    it('should remove recipe from book and return updated book', (done) => {
      // Log in the user first
      userService.logIn('test@test.com').subscribe(() => {
        service.removeRecipeFromBook('recipe1').subscribe(recipeBook => {
          expect(recipeBook).toEqual({ userId: '123', recipes: ['recipe2'] });
          done();
        });

        const deleteReq = httpMock.expectOne('/api/user/123/recipe-book/recipe1');
        expect(deleteReq.request.method).toBe('DELETE');
        deleteReq.flush({});

        const getReq = httpMock.expectOne('/api/user/123/recipe-book');
        expect(getReq.request.method).toBe('GET');
        getReq.flush({ userId: '123', recipes: ['recipe2'] });
      });

      const loginReq = httpMock.expectOne('/api/user?email=test%40test.com');
      loginReq.flush(mockUser);
    });

    it('should throw error when user is not logged in', () => {
      // Ensure no user is logged in
      localStorage.clear();
      userService.logOut();

      expect(() => service.removeRecipeFromBook('recipe1')).toThrowError('User must be logged in');
    });
  });
});
