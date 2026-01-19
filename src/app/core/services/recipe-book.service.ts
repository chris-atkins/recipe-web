import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserService } from './user.service';

export interface RecipeBook {
  userId: string;
  recipes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RecipeBookService {
  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {}

  getRecipeBook(userId?: string): Promise<RecipeBook> {
    const id = userId || this.userService.getLoggedInUser()?.userId;
    if (!id) {
      return Promise.reject(new Error('No user ID available'));
    }
    return firstValueFrom(this.http.get<RecipeBook>(`/api/user/${id}/recipe-book`));
  }

  async addToRecipeBook(recipeId: string): Promise<RecipeBook> {
    const userId = this.userService.getLoggedInUser()?.userId;
    if (!userId) {
      throw new Error('User must be logged in');
    }
    await firstValueFrom(this.http.post(`/api/user/${userId}/recipe-book`, { recipeId }));
    return this.getRecipeBook();
  }

  async removeRecipeFromBook(recipeId: string): Promise<RecipeBook> {
    const userId = this.userService.getLoggedInUser()?.userId;
    if (!userId) {
      throw new Error('User must be logged in');
    }
    await firstValueFrom(this.http.delete(`/api/user/${userId}/recipe-book/${recipeId}`));
    return this.getRecipeBook();
  }
}
