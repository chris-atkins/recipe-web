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
  category?: string | null;   // real + writable (set on the save form)
  tags?: string[];            // real + writable
}

export interface RecipeRating {
  average: number;   // 3.5–5.0, rounded to one decimal
  count: number;     // faked integer >= 1 (real backend: 0 = "not yet rated")
}

/**
 * Read-only display model: a real Recipe decorated with the synthetic fields the
 * backend does not provide yet (rating + nutrition). Category/tags are now REAL
 * and inherited from Recipe. Built only on the READ path; never written back.
 * See the design-decisions memory.
 */
export interface RecipeCardView extends Recipe {
  rating: RecipeRating;
  // Slice 3 — preview fields (faked, deterministic per recipe)
  calories: number;
  activeTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = '/api/recipe';

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

  /** Tags most commonly used on recipes in the given category, most-used first. */
  getTagSuggestions(category: string): Promise<string[]> {
    return firstValueFrom(this.http.get<string[]>(`${this.apiUrl}/tag-suggestions`, {
      params: { category }
    }));
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
  // Category + tags are now REAL (passed through verbatim from the backend).
  // Rating + nutrition are still faked here so the redesigned UI has values to
  // show; nothing here is ever written back. Remove as the backend grows them.

  private decorateList(list: Recipe[] | null): RecipeCardView[] {
    return (list ?? []).map(recipe => this.decorate(recipe));
  }

  private decorate(recipe: Recipe): RecipeCardView {
    const activeTimeMinutes = 10 + this.stableIndex(recipe, 6) * 5; // 10–35
    return {
      ...recipe,
      tags: recipe.tags ?? [],
      rating: this.fakeRating(),
      calories: 150 + this.stableIndex(recipe, 38) * 10,             // 150–520
      activeTimeMinutes,
      totalTimeMinutes: activeTimeMinutes + 10 + this.stableIndex(recipe, 5) * 5, // active + 10–30
      servings: 2 + this.stableIndex(recipe, 7)                      // 2–8
    };
  }

  // Random, generated once per fetch (not memoized, not in a template getter)
  // so it stays stable within a view but re-randomizes on a fresh fetch.
  private fakeRating(): RecipeRating {
    const average = Math.round((3.5 + this.nextRandom() * 1.5) * 10) / 10; // 3.5–5.0, one decimal
    const count = Math.floor(this.nextRandom() * 296) + 5;                 // 5–300
    return { average, count };
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
