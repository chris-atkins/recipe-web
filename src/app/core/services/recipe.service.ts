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

  searchRecipes(searchString?: string): Promise<Recipe[]> {
    const params: any = {};
    if (searchString) {
      params.searchString = searchString;
    }
    return firstValueFrom(this.http.get<Recipe[]>(this.apiUrl, { params }));
  }

  allRecipesInUserBook(userId: string): Promise<Recipe[]> {
    return firstValueFrom(this.http.get<Recipe[]>(this.apiUrl, {
      params: { recipeBook: userId }
    }));
  }

  getRecipeList(): Promise<Recipe[]> {
    return firstValueFrom(this.http.get<Recipe[]>(this.apiUrl));
  }
}
