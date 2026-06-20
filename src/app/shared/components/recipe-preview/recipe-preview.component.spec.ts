import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RecipePreviewComponent } from './recipe-preview.component';
import { RecipeBookService } from '../../../core/services/recipe-book.service';
import { RecipeCardView } from '../../../core/services/recipe.service';

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
    servings: 4,
    ingredients: ['1 onion, diced', '2 cloves garlic', '1 tsp salt']
  };

  beforeEach(() => {
    const recipeBookSpy = jasmine.createSpyObj('RecipeBookService', ['addToRecipeBook']);

    TestBed.configureTestingModule({
      declarations: [RecipePreviewComponent],
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

    it('renders the star rating split for 4.3 (4 full + 1 half)', () => {
      const stars = fixture.nativeElement.querySelector('.stars');
      expect(stars.querySelectorAll('.fa-star').length).toBe(4);
      expect(stars.querySelectorAll('.fa-star-half-o').length).toBe(1);
    });

    it('renders the rating average and count', () => {
      const meta = fixture.nativeElement.querySelector('.preview-rating-meta');
      expect(meta.textContent).toContain('4.3');
      expect(meta.textContent).toContain('12');
    });

    it('renders the category pill and tag pills', () => {
      const cat = fixture.nativeElement.querySelector('.card-cat-pill');
      expect(cat.textContent).toContain('Main Dish');
      const tags = fixture.nativeElement.querySelectorAll('.card-tag-pill');
      expect(tags.length).toBe(2);
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

    it('shows a disclaimer that ratings and stat values are sample data', () => {
      const disclaimer = fixture.nativeElement.querySelector('.stats-disclaimer');
      expect(disclaimer).toBeTruthy();
      const text = disclaimer.textContent.toLowerCase();
      expect(text).toContain('ratings');
      expect(text).toContain('sample data');
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
    it('returns safe values from the display helpers when recipe is null', () => {
      component.recipe = null;

      expect(component.starTypes().length).toBe(5);
      expect(component.getCategoryColor()).toBe('#666666');
    });
  });
});
