import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RecipePreviewComponent } from './recipe-preview.component';
import { RecipeBookService } from '../../../core/services/recipe-book.service';
import { RecipeCardView } from '../../../core/services/recipe.service';

@Component({ selector: 'app-rating-stars', template: '' })
class MockRatingStarsComponent {
  @Input() rating: any;
  @Input() recipeId?: string;
  @Input() interactive = false;
  @Output() ratingChange = new EventEmitter<any>();
}

describe('RecipePreviewComponent', () => {
  let component: RecipePreviewComponent;
  let fixture: ComponentFixture<RecipePreviewComponent>;
  let recipeBookService: jasmine.SpyObj<RecipeBookService>;
  let router: Router;

  const mockRecipe: RecipeCardView = {
    recipeId: 'recipe1',
    recipeName: 'Test Recipe',
    recipeContent: 'Ingredients:\n1 cup flour\nMix and bake.',
    rating: { average: 4.3, count: 12 },
    category: 'Main Dish',
    tags: ['Vegetarian', 'Quick & Easy'],
    calories: 320,
    activeTimeMinutes: 20,
    totalTimeMinutes: 35,
    servings: 4
  };

  beforeEach(() => {
    const recipeBookSpy = jasmine.createSpyObj('RecipeBookService', ['addToRecipeBook']);

    TestBed.configureTestingModule({
      declarations: [RecipePreviewComponent, MockRatingStarsComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: RecipeBookService, useValue: recipeBookSpy }
      ]
    });

    fixture = TestBed.createComponent(RecipePreviewComponent);
    component = fixture.componentInstance;
    recipeBookService = TestBed.inject(RecipeBookService) as jasmine.SpyObj<RecipeBookService>;
    router = TestBed.inject(Router);

    fixture.componentRef.setInput('recipe', mockRecipe);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('renders the recipe title', () => {
      const title = fixture.nativeElement.querySelector('.preview-title');
      expect(title.textContent).toContain('Test Recipe');
    });

    it('renders the interactive rating widget bound to the recipe', () => {
      const stars = fixture.debugElement.query(By.css('app-rating-stars'));
      expect(stars).toBeTruthy();
      expect(stars.componentInstance.rating).toEqual({ average: 4.3, count: 12 });
      expect(stars.componentInstance.recipeId).toBe('recipe1');
      expect(stars.componentInstance.interactive).toBe(true);
    });

    it('renders the category pill and tag pills', () => {
      const cat = fixture.nativeElement.querySelector('.card-cat-pill');
      expect(cat.textContent).toContain('Main Dish');
      const tags = fixture.nativeElement.querySelectorAll('.card-tag-pill');
      expect(tags.length).toBe(2);
    });

    it('renders no category pill for an uncategorized recipe', () => {
      component.recipe = { ...mockRecipe, category: null, tags: [] };
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.card-cat-pill')).toBeFalsy();
      expect(fixture.nativeElement.querySelectorAll('.card-tag-pill').length).toBe(0);
    });

    it('renders the 4-cell stats bar with values', () => {
      const cells = fixture.nativeElement.querySelectorAll('.stat-cell');
      expect(cells.length).toBe(4);
      const text = fixture.nativeElement.querySelector('.stats-bar').textContent;
      expect(text).toContain('320');
      expect(text).toContain('20 min');
      expect(text).toContain('35 min');
      expect(text).toContain('4');
    });

    it('renders the real recipe content (not placeholder ingredients)', () => {
      const content = fixture.nativeElement.querySelector('.preview-recipe-content');
      expect(content).toBeTruthy();
      expect(content.textContent).toContain('1 cup flour');
      expect(content.textContent).toContain('Mix and bake');
      // newlines converted to <br>, matching the full recipe page
      expect(content.innerHTML).toContain('<br>');
    });

    it('shows a disclaimer that the stat values are sample data (ratings are real now)', () => {
      const disclaimer = fixture.nativeElement.querySelector('.stats-disclaimer');
      expect(disclaimer).toBeTruthy();
      const text = disclaimer.textContent.toLowerCase();
      expect(text).toContain('sample data');
      expect(text).not.toContain('rating');
    });

    it('renders the action buttons', () => {
      expect(fixture.nativeElement.querySelector('.btn-primary').textContent).toContain('View Full Recipe');
      expect(fixture.nativeElement.querySelector('.btn-outline').textContent).toContain('Add to Recipe Book');
    });

    it('renders nothing when closed', () => {
      component.open = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.preview-panel')).toBeFalsy();
    });

    it('renders nothing when recipe is null', () => {
      component.recipe = null;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.preview-panel')).toBeFalsy();
    });
  });

  describe('closing', () => {
    it('emits closed when the close button is clicked', () => {
      spyOn(component.closed, 'emit');
      fixture.nativeElement.querySelector('.preview-close').click();
      expect(component.closed.emit).toHaveBeenCalled();
    });

    it('emits closed on backdrop click but not on a click inside the panel', () => {
      spyOn(component.closed, 'emit');

      fixture.nativeElement.querySelector('.preview-panel').click();
      expect(component.closed.emit).not.toHaveBeenCalled();

      fixture.nativeElement.querySelector('.modal-overlay').click();
      expect(component.closed.emit).toHaveBeenCalled();
    });

    it('emits closed on Escape when open', () => {
      spyOn(component.closed, 'emit');
      component.onEscape();
      expect(component.closed.emit).toHaveBeenCalled();
    });

    it('does not emit closed on Escape when not open', () => {
      component.open = false;
      spyOn(component.closed, 'emit');
      component.onEscape();
      expect(component.closed.emit).not.toHaveBeenCalled();
    });
  });

  describe('actions', () => {
    it('navigates to the full recipe and closes on View Full Recipe', () => {
      const navigateSpy = spyOn(router, 'navigate');
      spyOn(component.closed, 'emit');

      component.viewFullRecipe();

      expect(navigateSpy).toHaveBeenCalledWith(['/view-recipe', 'recipe1']);
      expect(component.closed.emit).toHaveBeenCalled();
    });

    it('calls the recipe book service on Add to Recipe Book', () => {
      recipeBookService.addToRecipeBook.and.returnValue(Promise.resolve([]));

      component.addToRecipeBook();

      expect(recipeBookService.addToRecipeBook).toHaveBeenCalledWith('recipe1');
    });

    it('does nothing on Add to Recipe Book when the recipe has no id', () => {
      component.recipe = { ...mockRecipe, recipeId: undefined };

      component.addToRecipeBook();

      expect(recipeBookService.addToRecipeBook).not.toHaveBeenCalled();
    });

    it('does not navigate but still closes on View Full Recipe when the recipe has no id', () => {
      const navigateSpy = spyOn(router, 'navigate');
      spyOn(component.closed, 'emit');
      component.recipe = { ...mockRecipe, recipeId: undefined };

      component.viewFullRecipe();

      expect(navigateSpy).not.toHaveBeenCalled();
      expect(component.closed.emit).toHaveBeenCalled();
    });
  });

  describe('defensive defaults', () => {
    it('returns a safe category colour when recipe is null', () => {
      component.recipe = null;
      expect(component.getCategoryColor()).toBe('#666666');
    });

    it('updates the recipe rating when the widget reports a new rating', () => {
      component.recipe = { ...mockRecipe };
      component.onRatingChange({ average: 4.8, count: 13 });
      expect(component.recipe!.rating).toEqual({ average: 4.8, count: 13 });
    });
  });
});
