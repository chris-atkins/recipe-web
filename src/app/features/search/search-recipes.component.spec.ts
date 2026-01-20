import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { SearchRecipesComponent } from './search-recipes.component';
import { RecipeService } from '../../core/services/recipe.service';
import { RecipeBookService } from '../../core/services/recipe-book.service';
import { SharedModule } from '../../shared/shared.module';

describe('SearchRecipesComponent', () => {
  let component: SearchRecipesComponent;
  let fixture: ComponentFixture<SearchRecipesComponent>;
  let mockRecipeService: jasmine.SpyObj<RecipeService>;
  let mockRecipeBookService: jasmine.SpyObj<RecipeBookService>;

  beforeEach(async () => {
    mockRecipeService = jasmine.createSpyObj('RecipeService', ['searchRecipes']);
    mockRecipeBookService = jasmine.createSpyObj('RecipeBookService', ['getRecipeBook']);

    mockRecipeService.searchRecipes.and.returnValue(Promise.resolve([]));
    mockRecipeBookService.getRecipeBook.and.returnValue(Promise.resolve({ userId: 'test', recipes: [] }));

    await TestBed.configureTestingModule({
      declarations: [SearchRecipesComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        SharedModule
      ],
      providers: [
        { provide: RecipeService, useValue: mockRecipeService },
        { provide: RecipeBookService, useValue: mockRecipeBookService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchRecipesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty values', () => {
    expect(component.recipeList).toEqual([]);
    expect(component.searchString).toBe('');
    expect(component.searchHasOccurred).toBe(false);
    expect(component.usersRecipeBook).toBeNull();
  });

  it('should call searchRecipes on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mockRecipeService.searchRecipes).toHaveBeenCalled();
  });

  it('should call getRecipeBook on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mockRecipeBookService.getRecipeBook).toHaveBeenCalled();
  });

  it('should set resultInfoMessage to show all recipes when no search string', async () => {
    mockRecipeService.searchRecipes.and.returnValue(Promise.resolve([
      { recipeId: '1', recipeName: 'Test', recipeContent: 'Content' }
    ]));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.resultInfoMessage).toBe('Showing all recipes');
  });

  it('should display the page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('#search-recipes-page-title');
    expect(title.textContent).toBe('Search Recipes');
  });

  it('should display search input with placeholder', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('#search-input');
    expect(input).toBeTruthy();
    expect(input.getAttribute('placeholder')).toBe('Search for...');
  });

  it('should display search button', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('#search-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('Search');
  });

  it('should display show all button', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('#show-all-recipes-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('Show All');
  });

  it('should show no results message when search returns empty', async () => {
    mockRecipeService.searchRecipes.and.returnValue(Promise.resolve([]));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const noResults = fixture.nativeElement.querySelector('#no-search-results-message');
    expect(noResults).toBeTruthy();
  });

  it('should hide no results message when recipes exist', async () => {
    mockRecipeService.searchRecipes.and.returnValue(Promise.resolve([
      { recipeId: '1', recipeName: 'Test', recipeContent: 'Content' }
    ]));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const noResults = fixture.nativeElement.querySelector('#no-search-results-message');
    expect(noResults).toBeFalsy();
  });
});
