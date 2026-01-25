import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RecipeBookComponent } from './recipe-book.component';
import { UserService, User } from '../../core/services/user.service';
import { RecipeService, Recipe } from '../../core/services/recipe.service';
import { RecipeBookService } from '../../core/services/recipe-book.service';

// Mock Navbar component
@Component({
  selector: 'app-navbar',
  template: '<div class="mock-navbar"></div>'
})
class MockNavbarComponent {}

// Mock RecipeCardWall component
@Component({
  selector: 'app-recipe-card-wall',
  template: '<div class="mock-recipe-card-wall"></div>'
})
class MockRecipeCardWallComponent {
  @Input() recipeList: Recipe[] = [];
  @Input() recipeBook: any = null;
  @Input() recipeBookMode: boolean = false;
  @Input() owningUserId: string = '';
  @Output() recipeRemoved = new EventEmitter<Recipe>();
}

describe('RecipeBookComponent', () => {
  let component: RecipeBookComponent;
  let fixture: ComponentFixture<RecipeBookComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockRecipeService: jasmine.SpyObj<RecipeService>;
  let mockRecipeBookService: jasmine.SpyObj<RecipeBookService>;
  let mockActivatedRoute: any;

  const testUser: User = { userId: '123', userName: 'Test User', userEmail: 'test@test.com' };
  const testRecipes: Recipe[] = [
    { recipeId: 'r1', recipeName: 'Recipe 1', recipeContent: 'Content 1' },
    { recipeId: 'r2', recipeName: 'Recipe 2', recipeContent: 'Content 2' }
  ];

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['getUserById', 'getLoggedInUser']);
    mockRecipeService = jasmine.createSpyObj('RecipeService', ['allRecipesInUserBook']);
    mockRecipeBookService = jasmine.createSpyObj('RecipeBookService', ['removeRecipeFromBook']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ userId: '123' })
      }
    };

    await TestBed.configureTestingModule({
      declarations: [RecipeBookComponent, MockNavbarComponent, MockRecipeCardWallComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: RecipeService, useValue: mockRecipeService },
        { provide: RecipeBookService, useValue: mockRecipeBookService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeBookComponent);
    component = fixture.componentInstance;
  });

  it('should create', async () => {
    mockUserService.getUserById.and.returnValue(Promise.resolve(testUser));
    mockRecipeService.allRecipesInUserBook.and.returnValue(Promise.resolve(testRecipes));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch user and recipes on init', async () => {
      mockUserService.getUserById.and.returnValue(Promise.resolve(testUser));
      mockRecipeService.allRecipesInUserBook.and.returnValue(Promise.resolve(testRecipes));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockUserService.getUserById).toHaveBeenCalledWith('123');
      expect(mockRecipeService.allRecipesInUserBook).toHaveBeenCalledWith('123');
      expect(component.user).toEqual(testUser);
      expect(component.recipeList).toEqual(testRecipes);
    });

    it('should handle error when fetching user', async () => {
      const consoleSpy = spyOn(console, 'error');
      mockUserService.getUserById.and.returnValue(Promise.reject('User not found'));
      mockRecipeService.allRecipesInUserBook.and.returnValue(Promise.resolve(testRecipes));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(consoleSpy).toHaveBeenCalledWith('Error retrieving user:', 'User not found');
      expect(component.user).toBeNull();
    });

    it('should handle error when fetching recipes', async () => {
      const consoleSpy = spyOn(console, 'error');
      mockUserService.getUserById.and.returnValue(Promise.resolve(testUser));
      mockRecipeService.allRecipesInUserBook.and.returnValue(Promise.reject('Recipes not found'));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(consoleSpy).toHaveBeenCalledWith('Error retrieving recipe book:', 'Recipes not found');
      expect(component.recipeList).toEqual([]);
    });

    it('should not fetch if userId is empty', async () => {
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({});
      fixture = TestBed.createComponent(RecipeBookComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockUserService.getUserById).not.toHaveBeenCalled();
      expect(mockRecipeService.allRecipesInUserBook).not.toHaveBeenCalled();
    });
  });

  describe('removeRecipeFromBook', () => {
    beforeEach(async () => {
      mockUserService.getUserById.and.returnValue(Promise.resolve(testUser));
      mockRecipeService.allRecipesInUserBook.and.returnValue(Promise.resolve([...testRecipes]));
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should remove recipe and refresh list', (done) => {
      const updatedRecipes = [testRecipes[1]];
      mockRecipeBookService.removeRecipeFromBook.and.returnValue(Promise.resolve([]));
      mockRecipeService.allRecipesInUserBook.and.returnValue(Promise.resolve(updatedRecipes));

      component.removeRecipeFromBook(testRecipes[0]);

      // Wait for the promise chain to complete
      setTimeout(() => {
        expect(mockRecipeBookService.removeRecipeFromBook).toHaveBeenCalledWith('r1');
        expect(component.recipeList).toEqual(updatedRecipes);
        done();
      }, 10);
    });

    it('should handle error when removing recipe', (done) => {
      const consoleSpy = spyOn(console, 'error');
      mockRecipeBookService.removeRecipeFromBook.and.returnValue(Promise.reject('Remove failed'));

      component.removeRecipeFromBook(testRecipes[0]);

      // Wait for the promise chain to complete
      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error removing recipe from book:', 'Remove failed');
        done();
      }, 10);
    });
  });

  describe('actionsAllowed', () => {
    beforeEach(async () => {
      mockUserService.getUserById.and.returnValue(Promise.resolve(testUser));
      mockRecipeService.allRecipesInUserBook.and.returnValue(Promise.resolve(testRecipes));
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should return true when logged-in user matches book owner', () => {
      mockUserService.getLoggedInUser.and.returnValue({ userId: '123', userName: 'Test', userEmail: 'test@test.com' });

      expect(component.actionsAllowed()).toBe(true);
    });

    it('should return false when logged-in user does not match book owner', () => {
      mockUserService.getLoggedInUser.and.returnValue({ userId: '456', userName: 'Other', userEmail: 'other@test.com' });

      expect(component.actionsAllowed()).toBe(false);
    });

    it('should return false when no user is logged in', () => {
      mockUserService.getLoggedInUser.and.returnValue(null);

      expect(component.actionsAllowed()).toBe(false);
    });
  });

  describe('template', () => {
    beforeEach(async () => {
      mockUserService.getUserById.and.returnValue(Promise.resolve(testUser));
      mockRecipeService.allRecipesInUserBook.and.returnValue(Promise.resolve(testRecipes));
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should display the page title with user name', () => {
      fixture.detectChanges();
      const titleElement = fixture.nativeElement.querySelector('#page-title');
      expect(titleElement.textContent).toContain('Recipe Book: Test User');
    });

    it('should render the recipe card wall component', () => {
      fixture.detectChanges();
      const cardWall = fixture.nativeElement.querySelector('app-recipe-card-wall');
      expect(cardWall).toBeTruthy();
    });
  });
});
