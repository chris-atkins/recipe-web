import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RecipeCardWallComponent } from './recipe-card-wall.component';
import { RecipeElementComponent } from '../recipe-element/recipe-element.component';
import { RecipePreviewComponent } from '../recipe-preview/recipe-preview.component';
import { RecipeBookService, RecipeBook } from '../../../core/services/recipe-book.service';
import { UserService } from '../../../core/services/user.service';
import { Recipe, RecipeCardView } from '../../../core/services/recipe.service';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'app-rating-stars', template: '' })
class MockRatingStarsComponent {
  @Input() rating: any;
  @Input() recipeId?: string;
  @Input() interactive = false;
  @Output() ratingChange = new EventEmitter<any>();
}

describe('RecipeCardWallComponent', () => {
  let component: RecipeCardWallComponent;
  let fixture: ComponentFixture<RecipeCardWallComponent>;

  const mockRecipes: RecipeCardView[] = [
    { recipeId: 'recipe1', recipeName: 'Recipe 1', recipeContent: 'Content 1', rating: { average: 4.5, count: 10 }, category: 'Main Dish', tags: ['Vegetarian'], calories: 300, activeTimeMinutes: 20, totalTimeMinutes: 35, servings: 4 },
    { recipeId: 'recipe2', recipeName: 'Recipe 2', recipeContent: 'Content 2', rating: { average: 4.0, count: 8 }, category: 'Dessert', tags: ['Quick & Easy'], calories: 250, activeTimeMinutes: 15, totalTimeMinutes: 30, servings: 6 },
    { recipeId: 'recipe3', recipeName: 'Recipe 3', recipeContent: 'Content 3', rating: { average: 3.8, count: 5 }, category: 'Side Dish', tags: ['High Protein'], calories: 400, activeTimeMinutes: 25, totalTimeMinutes: 45, servings: 2 }
  ];

  const mockRecipeBook: RecipeBook = [{ recipeId: 'recipe1' }];

  beforeEach(() => {
    const recipeBookSpy = jasmine.createSpyObj('RecipeBookService', ['addToRecipeBook']);
    const userSpy = jasmine.createSpyObj('UserService', ['getLoggedInUser']);

    TestBed.configureTestingModule({
      declarations: [RecipeCardWallComponent, RecipeElementComponent, RecipePreviewComponent, MockRatingStarsComponent],
      imports: [RouterTestingModule],
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

  describe('preview', () => {
    it('defaults to preview disabled and closed', () => {
      expect(component.enablePreview).toBe(false);
      expect(component.previewOpen).toBe(false);
      expect(component.previewRecipe).toBeNull();
    });

    it('opens the preview with the selected recipe', () => {
      component.openPreview(mockRecipes[0]);

      expect(component.previewRecipe).toBe(mockRecipes[0]);
      expect(component.previewOpen).toBe(true);
    });
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
      expect(container.classList.contains('recipe-grid')).toBe(true);
    });

    it('should render correct number of recipe elements', () => {
      const recipeElements = fixture.nativeElement.querySelectorAll('app-recipe-element');
      expect(recipeElements.length).toBe(3);
    });
  });
});
