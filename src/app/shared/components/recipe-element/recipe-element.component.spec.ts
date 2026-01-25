import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeElementComponent } from './recipe-element.component';
import { RecipeBookService, RecipeBook } from '../../../core/services/recipe-book.service';
import { UserService, User } from '../../../core/services/user.service';
import { Recipe } from '../../../core/services/recipe.service';

describe('RecipeElementComponent', () => {
  let component: RecipeElementComponent;
  let fixture: ComponentFixture<RecipeElementComponent>;
  let recipeBookService: jasmine.SpyObj<RecipeBookService>;
  let userService: jasmine.SpyObj<UserService>;

  const mockRecipe: Recipe = {
    recipeId: 'recipe1',
    recipeName: 'Test Recipe',
    recipeContent: 'Test content',
    image: { imageUrl: 'https://example.com/image.jpg' }
  };

  const mockUser: User = {
    userId: 'user123',
    userName: 'Test User',
    userEmail: 'test@test.com'
  };

  const mockRecipeBook: RecipeBook = [{ recipeId: 'recipe1' }, { recipeId: 'recipe2' }];

  beforeEach(() => {
    const recipeBookSpy = jasmine.createSpyObj('RecipeBookService', ['addToRecipeBook']);
    const userSpy = jasmine.createSpyObj('UserService', ['getLoggedInUser']);

    TestBed.configureTestingModule({
      declarations: [RecipeElementComponent],
      providers: [
        { provide: RecipeBookService, useValue: recipeBookSpy },
        { provide: UserService, useValue: userSpy }
      ]
    });

    fixture = TestBed.createComponent(RecipeElementComponent);
    component = fixture.componentInstance;
    recipeBookService = TestBed.inject(RecipeBookService) as jasmine.SpyObj<RecipeBookService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;

    component.recipe = mockRecipe;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('imageExists', () => {
    it('should return true when recipe has an image', () => {
      component.recipe = mockRecipe;
      expect(component.imageExists()).toBe(true);
    });

    it('should return false when recipe has no image', () => {
      component.recipe = { ...mockRecipe, image: null as any };
      expect(component.imageExists()).toBe(false);
    });
  });

  describe('getImageUrl', () => {
    it('should return image URL when available', () => {
      component.recipe = mockRecipe;
      expect(component.getImageUrl()).toBe('https://example.com/image.jpg');
    });

    it('should return empty string when no image', () => {
      component.recipe = { ...mockRecipe, image: null as any };
      expect(component.getImageUrl()).toBe('');
    });
  });

  describe('removeAllowed', () => {
    it('should return true when logged in user matches owning user', () => {
      userService.getLoggedInUser.and.returnValue(mockUser);
      component.owningUserId = 'user123';
      expect(component.removeAllowed()).toBe(true);
    });

    it('should return false when logged in user does not match owning user', () => {
      userService.getLoggedInUser.and.returnValue(mockUser);
      component.owningUserId = 'differentUser';
      expect(component.removeAllowed()).toBe(false);
    });

    it('should return false when no user is logged in', () => {
      userService.getLoggedInUser.and.returnValue(null);
      component.owningUserId = 'user123';
      expect(component.removeAllowed()).toBe(false);
    });
  });

  describe('removeRecipe', () => {
    it('should emit recipeRemoved event', () => {
      spyOn(component.recipeRemoved, 'emit');
      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopImmediatePropagation');

      component.removeRecipe(mockEvent);

      expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
      expect(component.recipeRemoved.emit).toHaveBeenCalledWith(mockRecipe);
    });
  });

  describe('addToRecipeBook', () => {
    it('should call recipeBookService and update recipe book', (done) => {
      const updatedBook: RecipeBook = [{ recipeId: 'recipe1' }, { recipeId: 'recipe2' }, { recipeId: 'newRecipe' }];
      recipeBookService.addToRecipeBook.and.returnValue(Promise.resolve(updatedBook));

      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopImmediatePropagation');

      component.addToRecipeBook(mockEvent);

      setTimeout(() => {
        expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
        expect(recipeBookService.addToRecipeBook).toHaveBeenCalledWith('recipe1');
        expect(component.recipeBook).toEqual(updatedBook);
        done();
      }, 10);
    });
  });

  describe('navigateToRecipePage', () => {
    it('should navigate to recipe page using hash routing', () => {
      component.recipe = mockRecipe;

      component.navigateToRecipePage();

      expect(window.location.hash).toBe('#/view-recipe/recipe1');
    });
  });

  describe('recipe book flags', () => {
    it('should set recipeInRecipeBook to true when recipe is in book', () => {
      component.recipeBook = mockRecipeBook;
      component.recipe = mockRecipe;
      component.recipeBookMode = false;

      component.ngOnChanges({ recipeBook: {} as any });

      expect(component.recipeInRecipeBook).toBe(true);
      expect(component.canAddToRecipeBook).toBe(false);
    });

    it('should set canAddToRecipeBook to true when recipe is not in book', () => {
      component.recipeBook = [{ recipeId: 'otherRecipe' }];
      component.recipe = mockRecipe;
      component.recipeBookMode = false;

      component.ngOnChanges({ recipeBook: {} as any });

      expect(component.recipeInRecipeBook).toBe(false);
      expect(component.canAddToRecipeBook).toBe(true);
    });

    it('should not update flags in recipeBookMode', () => {
      component.recipeBookMode = true;
      component.recipeBook = mockRecipeBook;
      component.recipe = mockRecipe;

      component.ngOnChanges({ recipeBook: {} as any });

      expect(component.recipeInRecipeBook).toBe(false);
      expect(component.canAddToRecipeBook).toBe(false);
    });
  });

  describe('template rendering', () => {
    beforeEach(() => {
      component.recipe = mockRecipe;
      fixture.detectChanges();
    });

    it('should render recipe card with correct class', () => {
      const card = fixture.nativeElement.querySelector('.recipe.card');
      expect(card).toBeTruthy();
    });

    it('should render recipe name', () => {
      const recipeName = fixture.nativeElement.querySelector('.recipe-name');
      expect(recipeName.textContent).toContain('Test Recipe');
    });

    it('should render recipe image when present', () => {
      const image = fixture.nativeElement.querySelector('.recipe-image');
      expect(image).toBeTruthy();
      expect(image.getAttribute('src')).toBe('https://example.com/image.jpg');
    });
  });
});
