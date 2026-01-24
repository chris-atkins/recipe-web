import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeCardWallComponent } from './recipe-card-wall.component';
import { RecipeElementComponent } from '../recipe-element/recipe-element.component';
import { RecipeBookService, RecipeBook } from '../../../core/services/recipe-book.service';
import { UserService } from '../../../core/services/user.service';
import { Recipe } from '../../../core/services/recipe.service';

describe('RecipeCardWallComponent', () => {
  let component: RecipeCardWallComponent;
  let fixture: ComponentFixture<RecipeCardWallComponent>;

  const mockRecipes: Recipe[] = [
    { recipeId: 'recipe1', recipeName: 'Recipe 1', recipeContent: 'Content 1' },
    { recipeId: 'recipe2', recipeName: 'Recipe 2', recipeContent: 'Content 2' },
    { recipeId: 'recipe3', recipeName: 'Recipe 3', recipeContent: 'Content 3' }
  ];

  const mockRecipeBook: RecipeBook = [{ recipeId: 'recipe1' }];

  beforeEach(() => {
    const recipeBookSpy = jasmine.createSpyObj('RecipeBookService', ['addToRecipeBook']);
    const userSpy = jasmine.createSpyObj('UserService', ['getLoggedInUser']);

    TestBed.configureTestingModule({
      declarations: [RecipeCardWallComponent, RecipeElementComponent],
      providers: [
        { provide: RecipeBookService, useValue: recipeBookSpy },
        { provide: UserService, useValue: userSpy }
      ]
    });

    fixture = TestBed.createComponent(RecipeCardWallComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.recipeList).toEqual([]);
    expect(component.recipeBook).toBeNull();
    expect(component.recipeBookMode).toBe(false);
    expect(component.owningUserId).toBe('');
  });

  describe('onRecipeRemoved', () => {
    it('should emit recipeRemoved event', (done) => {
      const recipe = mockRecipes[0];

      component.recipeRemoved.subscribe((emittedRecipe: Recipe) => {
        expect(emittedRecipe).toEqual(recipe);
        done();
      });

      component.onRecipeRemoved(recipe);
    });
  });

  describe('trackByRecipeId', () => {
    it('should return recipeId when available', () => {
      const recipe: Recipe = { recipeId: 'test123', recipeName: 'Test', recipeContent: 'Content' };
      expect(component.trackByRecipeId(0, recipe)).toBe('test123');
    });

    it('should return index as string when no recipeId', () => {
      const recipe: Recipe = { recipeName: 'Test', recipeContent: 'Content' };
      expect(component.trackByRecipeId(5, recipe)).toBe('5');
    });
  });

  describe('template rendering', () => {
    beforeEach(() => {
      component.recipeList = mockRecipes;
      component.recipeBook = mockRecipeBook;
      fixture.detectChanges();
    });

    it('should render recipe-list container', () => {
      const container = fixture.nativeElement.querySelector('#recipe-list');
      expect(container).toBeTruthy();
      expect(container.classList.contains('card-columns')).toBe(true);
    });

    it('should render correct number of recipe elements', () => {
      const recipeElements = fixture.nativeElement.querySelectorAll('app-recipe-element');
      expect(recipeElements.length).toBe(3);
    });
  });
});
