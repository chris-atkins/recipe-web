import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recipe {
  recipeId?: string;
  recipeName: string;
  recipeContent: string;
  imageUrl?: string;
  editable?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = '/api/recipe';

  constructor(private http: HttpClient) {}

  findRecipe(recipeId: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${recipeId}`);
  }

  saveRecipe(recipe: Recipe): Observable<Recipe> {
    if (recipe.recipeId) {
      return this.http.put<Recipe>(`${this.apiUrl}/${recipe.recipeId}`, recipe);
    }
    return this.http.post<Recipe>(this.apiUrl, recipe);
  }

  searchRecipes(searchString?: string): Observable<Recipe[]> {
    const params: any = {};
    if (searchString) {
      params.searchString = searchString;
    }
    return this.http.get<Recipe[]>(this.apiUrl, { params });
  }

  allRecipesInUserBook(userId: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl, {
      params: { recipeBook: userId }
    });
  }

  getRecipeList(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl);
  }
}
