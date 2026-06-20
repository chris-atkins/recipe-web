import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { CategoryTagFilterComponent } from './category-tag-filter.component';
import { RecipeCardView } from '../../../core/services/recipe.service';

function makeRecipe(id: string, category: string, tags: string[]): RecipeCardView {
  return {
    recipeId: id,
    recipeName: 'Recipe ' + id,
    recipeContent: 'Content',
    rating: { average: 4, count: 5 },
    category,
    tags,
    calories: 200,
    activeTimeMinutes: 10,
    totalTimeMinutes: 20,
    servings: 2,
    ingredients: ['x']
  };
}

describe('CategoryTagFilterComponent', () => {
  let component: CategoryTagFilterComponent;
  let fixture: ComponentFixture<CategoryTagFilterComponent>;

  const r1 = makeRecipe('1', 'Main Dish', ['Vegetarian', 'Quick & Easy']);
  const r2 = makeRecipe('2', 'Main Dish', ['High Protein']);
  const r3 = makeRecipe('3', 'Dessert', ['Vegetarian']);
  const r4 = makeRecipe('4', 'Side Dish', ['Quick & Easy']);
  const recipes: RecipeCardView[] = [r1, r2, r3, r4];

  // Set recipes and run the change-detection lifecycle (ngOnChanges + render).
  function loadRecipes(list: RecipeCardView[]): void {
    component.recipes = list;
    component.ngOnChanges({ recipes: {} as any });
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryTagFilterComponent],
      imports: [CommonModule]
    });
    fixture = TestBed.createComponent(CategoryTagFilterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('derives the distinct categories present, sorted, and renders one pill each', () => {
    loadRecipes(recipes);

    expect(component.categories).toEqual(['Dessert', 'Main Dish', 'Side Dish']);
    const pills = fixture.nativeElement.querySelectorAll('.cat-pill');
    expect(pills.length).toBe(3);
    expect(pills[0].textContent).toContain('Dessert');
  });

  it('renders no category pills when there are no recipes', () => {
    loadRecipes([]);
    expect(fixture.nativeElement.querySelectorAll('.cat-pill').length).toBe(0);
  });

  it('does not show sub-tags until a category is selected', () => {
    loadRecipes(recipes);
    expect(fixture.nativeElement.querySelector('.tag-row')).toBeFalsy();
  });

  it('selecting a category emits only that category and reveals its sub-tags', () => {
    loadRecipes(recipes);
    spyOn(component.filteredChange, 'emit');

    component.selectCategory('Main Dish');
    fixture.detectChanges();

    expect(component.filteredChange.emit).toHaveBeenCalledWith([r1, r2]);
    // sub-tags = distinct tags among Main Dish recipes, sorted
    expect(component.subTags).toEqual(['High Protein', 'Quick & Easy', 'Vegetarian']);
    expect(fixture.nativeElement.querySelector('.tag-row')).toBeTruthy();
  });

  it('dims the unselected categories once one is selected', () => {
    loadRecipes(recipes);
    component.selectCategory('Main Dish');
    fixture.detectChanges();

    const pills = Array.from(fixture.nativeElement.querySelectorAll('.cat-pill')) as HTMLElement[];
    const dimmed = pills.filter(p => p.classList.contains('dimmed'));
    const selected = pills.filter(p => p.classList.contains('selected'));
    expect(selected.length).toBe(1);
    expect(dimmed.length).toBe(2);
  });

  it('narrows by sub-tags with AND semantics', () => {
    loadRecipes(recipes);
    component.selectCategory('Main Dish');
    spyOn(component.filteredChange, 'emit');

    component.toggleTag('Vegetarian');
    expect(component.filteredChange.emit).toHaveBeenCalledWith([r1]);
  });

  it('emits an empty list when no recipe has all selected tags (AND)', () => {
    loadRecipes(recipes);
    component.selectCategory('Main Dish');
    component.toggleTag('Vegetarian');
    spyOn(component.filteredChange, 'emit');

    component.toggleTag('High Protein'); // no Main Dish recipe has both

    expect(component.filteredChange.emit).toHaveBeenCalledWith([]);
  });

  it('re-selecting the active category clears the filter and emits the full list', () => {
    loadRecipes(recipes);
    component.selectCategory('Main Dish');
    component.toggleTag('Vegetarian');
    spyOn(component.filteredChange, 'emit');

    component.selectCategory('Main Dish'); // toggle off

    expect(component.selectedCategory).toBeNull();
    expect(component.selectedTags.size).toBe(0);
    expect(component.filteredChange.emit).toHaveBeenCalledWith(recipes);
  });

  it('resets selection and emits the full list when the recipes input changes', () => {
    loadRecipes(recipes);
    component.selectCategory('Main Dish');
    expect(component.selectedCategory).toBe('Main Dish');

    const newRecipes = [r3, r4];
    spyOn(component.filteredChange, 'emit');
    component.recipes = newRecipes;
    component.ngOnChanges({ recipes: {} as any });

    expect(component.selectedCategory).toBeNull();
    expect(component.subTags).toEqual([]);
    expect(component.filteredChange.emit).toHaveBeenCalledWith(newRecipes);
  });
});
