import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface RecipeImage {
  imageUrl: string;
}

export interface Recipe {
  recipeId?: string;
  recipeName: string;
  recipeContent: string;
  imageUrl?: string;
  image?: RecipeImage | null;
  editable?: boolean;
}

export interface RecipeRating {
  average: number;   // 3.5–5.0, rounded to one decimal
  count: number;     // faked integer >= 1 (real backend: 0 = "not yet rated")
}

/**
 * Read-only display model: a real Recipe decorated with synthetic fields the
 * backend does not provide yet (rating/category/tags). Built only on the READ
 * path; never written back to the server. See the design-decisions memory.
 * TODO: consider collapsing into Recipe once the backend grows these fields.
 */
export interface RecipeCardView extends Recipe {
  rating: RecipeRating;
  category: string;
  tags: string[];
  // Slice 3 — preview fields (faked, deterministic per recipe)
  calories: number;
  activeTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  ingredients: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = '/api/recipe';

  // Generic placeholder pools — swapped for real backend values in a later slice.
  private static readonly FAKE_CATEGORIES = ['Main Dish', 'Side Dish', 'Dessert'];
  private static readonly FAKE_TAGS = ['Vegetarian', 'Quick & Easy', 'High Protein'];
  private static readonly FAKE_INGREDIENTS = [
    '2 tbsp olive oil',
    '1 onion, diced',
    '2 cloves garlic, minced',
    '1 tsp salt',
    '1/2 tsp black pepper',
    '1 cup vegetable broth',
    '2 cups mixed vegetables',
    '1 tbsp fresh herbs'
  ];

  constructor(private http: HttpClient) {}

  findRecipe(recipeId: string): Promise<Recipe> {
    return firstValueFrom(this.http.get<Recipe>(`${this.apiUrl}/${recipeId}`));
  }

  saveRecipe(recipe: Recipe): Promise<Recipe> {
    if (recipe.recipeId) {
      return firstValueFrom(this.http.put<Recipe>(`${this.apiUrl}/${recipe.recipeId}`, recipe));
    }
    return firstValueFrom(this.http.post<Recipe>(this.apiUrl, recipe));
  }

  searchRecipes(searchString?: string): Promise<RecipeCardView[]> {
    const params: any = {};
    if (searchString) {
      params.searchString = searchString;
    }
    return firstValueFrom(this.http.get<Recipe[]>(this.apiUrl, { params }))
      .then(list => this.decorateList(list));
  }

  allRecipesInUserBook(userId: string): Promise<RecipeCardView[]> {
    return firstValueFrom(this.http.get<Recipe[]>(this.apiUrl, {
      params: { recipeBook: userId }
    })).then(list => this.decorateList(list));
  }

  getRecipeList(): Promise<RecipeCardView[]> {
    return firstValueFrom(this.http.get<Recipe[]>(this.apiUrl))
      .then(list => this.decorateList(list));
  }

  // --- Synthetic fake-data decoration (READ path only) -----------------------
  // TEMPORARY: the backend has no ratings/category/tags yet. We decorate real
  // read responses so the redesigned UI can be built against the eventual
  // contract. Real recipe fields pass through verbatim; nothing here is ever
  // written back to the server. Remove/replace when the backend provides these.

  private decorateList(list: Recipe[] | null): RecipeCardView[] {
    return (list ?? []).map(recipe => this.decorate(recipe));
  }

  private decorate(recipe: Recipe): RecipeCardView {
    const activeTimeMinutes = 10 + this.stableIndex(recipe, 6) * 5; // 10–35
    return {
      ...recipe,
      rating: this.fakeRating(),
      category: this.fakeCategory(recipe),
      tags: this.fakeTags(recipe),
      calories: 150 + this.stableIndex(recipe, 38) * 10,             // 150–520
      activeTimeMinutes,
      totalTimeMinutes: activeTimeMinutes + 10 + this.stableIndex(recipe, 5) * 5, // active + 10–30
      servings: 2 + this.stableIndex(recipe, 7),                     // 2–8
      ingredients: this.fakeIngredients(recipe)
    };
  }

  // Random, generated once per fetch (not memoized, not in a template getter)
  // so it stays stable within a view but re-randomizes on a fresh fetch.
  private fakeRating(): RecipeRating {
    const average = Math.round((3.5 + this.nextRandom() * 1.5) * 10) / 10; // 3.5–5.0, one decimal
    const count = Math.floor(this.nextRandom() * 296) + 5;                 // 5–300
    return { average, count };
  }

  // Deterministic per recipe so a given card's category/tags stay stable.
  private fakeCategory(recipe: Recipe): string {
    const pool = RecipeService.FAKE_CATEGORIES;
    return pool[this.stableIndex(recipe, pool.length)];
  }

  private fakeTags(recipe: Recipe): string[] {
    const pool = RecipeService.FAKE_TAGS;
    const start = this.stableIndex(recipe, pool.length);
    const howMany = this.stableIndex(recipe, 2) + 1; // 1 or 2 tags, deterministic
    const tags: string[] = [];
    for (let i = 0; i < howMany; i++) {
      tags.push(pool[(start + i) % pool.length]);
    }
    return tags;
  }

  // Deterministic generic ingredient list (placeholder until the backend has real data).
  private fakeIngredients(recipe: Recipe): string[] {
    const pool = RecipeService.FAKE_INGREDIENTS;
    const howMany = 4 + this.stableIndex(recipe, 3); // 4–6 lines
    const start = this.stableIndex(recipe, pool.length);
    const ingredients: string[] = [];
    for (let i = 0; i < howMany; i++) {
      ingredients.push(pool[(start + i) % pool.length]);
    }
    return ingredients;
  }

  // Stable hash of the recipe identity (recipeId, falling back to recipeName).
  private stableIndex(recipe: Recipe, mod: number): number {
    const key = recipe.recipeId ?? recipe.recipeName ?? '';
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i)) % 100000;
    }
    return hash % mod;
  }

  /** Seam for deterministic tests; wraps Math.random so specs can stub it. */
  protected nextRandom(): number {
    return Math.random();
  }
}
