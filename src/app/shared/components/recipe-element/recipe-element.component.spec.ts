import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RecipeElementComponent } from './recipe-element.component';
import { RecipeBookService, RecipeBook } from '../../../core/services/recipe-book.service';
import { UserService, User } from '../../../core/services/user.service';
import { RecipeCardView } from '../../../core/services/recipe.service';

@Component({ selector: 'app-rating-stars', template: '' })
class MockRatingStarsComponent {
  @Input() rating: any;
  @Input() recipeId?: string;
  @Input() interactive = false;
  @Output() ratingChange = new EventEmitter<any>();
}

describe('RecipeElementComponent', () => {
  let component: RecipeElementComponent;
  let fixture: ComponentFixture<RecipeElementComponent>;
  let recipeBookService: jasmine.SpyObj<RecipeBookService>;
  let userService: jasmine.SpyObj<UserService>;
  let router: Router;

  const mockRecipe: RecipeCardView = {
    recipeId: 'recipe1',
    recipeName: 'Test Recipe',
    recipeContent: 'Test content',
    image: { imageUrl: 'https://example.com/image.jpg' },
    rating: { average: 4.3, count: 12 },
    category: 'Main Dish',
    tags: ['Vegetarian', 'Quick & Easy'],
    calories: 320,
    activeTimeMinutes: 20,
    totalTimeMinutes: 35,
    servings: 4
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
      declarations: [RecipeElementComponent, MockRatingStarsComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: RecipeBookService, useValue: recipeBookSpy },
        { provide: UserService, useValue: userSpy }
      ]
    });

    fixture = TestBed.createComponent(RecipeElementComponent);
    component = fixture.componentInstance;
    recipeBookService = TestBed.inject(RecipeBookService) as jasmine.SpyObj<RecipeBookService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router);

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

  describe('category helpers', () => {
    it('maps a known category to its color', () => {
      component.recipe = { ...mockRecipe, category: 'Main Dish' };
      expect(component.getCategoryColor()).toBe('#c9342a');
    });

    it('falls back to a default color for an unknown category', () => {
      component.recipe = { ...mockRecipe, category: 'Nonexistent' };
      expect(component.getCategoryColor()).toBe('#666666');
    });

    it('maps a known category to its emoji', () => {
      component.recipe = { ...mockRecipe, category: 'Dessert' };
      expect(component.getCategoryEmoji()).toBe('🎂');
    });

    it('falls back to a default emoji for an unknown category', () => {
      component.recipe = { ...mockRecipe, category: 'Nonexistent' };
      expect(component.getCategoryEmoji()).toBe('🍽️');
    });

    it('falls back to the default color when the recipe is missing', () => {
      component.recipe = undefined as any;
      expect(component.getCategoryColor()).toBe('#666666');
    });

    it('falls back to the default emoji when the recipe is missing', () => {
      component.recipe = undefined as any;
      expect(component.getCategoryEmoji()).toBe('🍽️');
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

    it('should do nothing when the recipe has no id', () => {
      component.recipe = { ...mockRecipe, recipeId: undefined };
      const mockEvent = new Event('click');

      component.addToRecipeBook(mockEvent);

      expect(recipeBookService.addToRecipeBook).not.toHaveBeenCalled();
    });
  });

  describe('navigateToRecipePage', () => {
    it('should navigate to recipe page using router', () => {
      spyOn(router, 'navigate');
      component.recipe = mockRecipe;

      component.navigateToRecipePage();

      expect(router.navigate).toHaveBeenCalledWith(['/view-recipe', 'recipe1']);
    });
  });

  describe('onCardClick', () => {
    it('emits recipeSelected and does not navigate in preview mode', () => {
      spyOn(component.recipeSelected, 'emit');
      spyOn(router, 'navigate');
      component.previewMode = true;
      component.recipe = mockRecipe;

      component.onCardClick();

      expect(component.recipeSelected.emit).toHaveBeenCalledWith(mockRecipe);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('navigates and does not emit when not in preview mode', () => {
      spyOn(component.recipeSelected, 'emit');
      spyOn(router, 'navigate');
      component.previewMode = false;
      component.recipe = mockRecipe;

      component.onCardClick();

      expect(router.navigate).toHaveBeenCalledWith(['/view-recipe', 'recipe1']);
      expect(component.recipeSelected.emit).not.toHaveBeenCalled();
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

    it('renders the rating widget bound to the recipe rating (read-only)', () => {
      const stars = fixture.debugElement.query(By.css('app-rating-stars'));
      expect(stars).toBeTruthy();
      expect(stars.componentInstance.rating).toEqual({ average: 4.3, count: 12 });
      expect(stars.componentInstance.interactive).toBeFalsy();
    });

    it('should render the category pill with the category name', () => {
      const pill = fixture.nativeElement.querySelector('.card-cat-pill');
      expect(pill).toBeTruthy();
      expect(pill.textContent).toContain('Main Dish');
    });

    it('should render one tag pill per tag', () => {
      const tags = fixture.nativeElement.querySelectorAll('.card-tag-pill');
      expect(tags.length).toBe(2);
      expect(tags[0].textContent).toContain('Vegetarian');
      expect(tags[1].textContent).toContain('Quick & Easy');
    });

    it('renders no category pill or tags for an uncategorized recipe', () => {
      component.recipe = { ...mockRecipe, category: null, tags: [] };
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.card-cat-pill')).toBeFalsy();
      expect(fixture.nativeElement.querySelectorAll('.card-tag-pill').length).toBe(0);
    });

    it('should render the category emoji placeholder when there is no photo', () => {
      component.recipe = { ...mockRecipe, image: null as any };
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.recipe-image')).toBeFalsy();
      const placeholder = fixture.nativeElement.querySelector('.recipe-thumb-placeholder');
      expect(placeholder).toBeTruthy();
      expect(placeholder.textContent).toContain('🍖'); // Main Dish emoji
    });
  });
});
