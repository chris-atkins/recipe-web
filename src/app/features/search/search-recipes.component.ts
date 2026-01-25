import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Recipe, RecipeService } from '../../core/services/recipe.service';
import { RecipeBook, RecipeBookService } from '../../core/services/recipe-book.service';

@Component({
  selector: 'app-search-recipes',
  templateUrl: './search-recipes.component.html',
  styleUrls: ['./search-recipes.component.css']
})
export class SearchRecipesComponent implements OnInit, OnDestroy {
  recipeList: Recipe[] = [];
  searchString = '';
  searchHasOccurred = false;
  usersRecipeBook: RecipeBook | null = null;
  resultInfoMessage = '';

  private queryParamsSubscription: Subscription | null = null;

  private skipNextQueryParamsSearch = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private recipeBookService: RecipeBookService
  ) {}

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      // Skip if we just triggered a navigation from searchRecipes/showAllRecipes
      if (this.skipNextQueryParamsSearch) {
        this.skipNextQueryParamsSearch = false;
        return;
      }

      const searchFor = params['searchFor'];
      if (!searchFor || searchFor === 'all') {
        this.searchString = '';
        this.performSearchAndDisplayResults();
      } else {
        this.searchString = searchFor;
        this.performSearchAndDisplayResults(searchFor);
      }
    });

    this.retrieveUserRecipeBook();
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  searchRecipes(): void {
    // Perform search directly and update URL for bookmarking
    // Pass clearFirst=true to clear old results before showing new ones
    this.performSearchAndDisplayResults(this.searchString || undefined, true);
    // Set flag to skip the subscription callback triggered by navigation
    this.skipNextQueryParamsSearch = true;
    this.router.navigate(['/search-recipes'], {
      queryParams: { searchFor: this.searchString || 'all' }
    });
  }

  showAllRecipes(): void {
    this.searchString = '';
    // Pass clearFirst=true to clear old results before showing new ones
    this.performSearchAndDisplayResults(undefined, true);
    // Set flag to skip the subscription callback triggered by navigation
    this.skipNextQueryParamsSearch = true;
    this.router.navigate(['/search-recipes'], {
      queryParams: { searchFor: 'all' }
    });
  }

  private performSearchAndDisplayResults(searchString?: string, clearFirst: boolean = false): void {
    // Only clear results when explicitly requested (user-initiated search)
    // This prevents flashing empty state during initial page load
    if (clearFirst) {
      this.recipeList = [];
    }

    this.recipeService.searchRecipes(searchString)
      .then((data: Recipe[]) => {
        this.recipeList = data;
        this.searchHasOccurred = true;
        this.resultInfoMessage = searchString === undefined
          ? 'Showing all recipes'
          : `Showing recipes that match "${searchString}"`;
      })
      .catch((error: any) => {
        console.error('Error getting recipes:', error);
      });
  }

  private retrieveUserRecipeBook(): void {
    this.recipeBookService.getRecipeBook()
      .then((recipeBook: RecipeBook) => {
        this.usersRecipeBook = recipeBook;
      })
      .catch((error: any) => {
        console.log('Error getting recipe book:', error);
      });
  }
}
