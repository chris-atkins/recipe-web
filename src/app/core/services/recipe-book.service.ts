import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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

  getRecipeBook(userId?: string): Observable<RecipeBook> {
    const id = userId || this.userService.getLoggedInUser()?.userId;
    if (!id) {
      throw new Error('No user ID available');
    }
    return this.http.get<RecipeBook>(`/api/user/${id}/recipe-book`);
  }

  addToRecipeBook(recipeId: string): Observable<RecipeBook> {
    const userId = this.userService.getLoggedInUser()?.userId;
    if (!userId) {
      throw new Error('User must be logged in');
    }
    return this.http
      .post(`/api/user/${userId}/recipe-book`, { recipeId })
      .pipe(
        switchMap(() => this.getRecipeBook())
      );
  }

  removeRecipeFromBook(recipeId: string): Observable<RecipeBook> {
    const userId = this.userService.getLoggedInUser()?.userId;
    if (!userId) {
      throw new Error('User must be logged in');
    }
    return this.http
      .delete(`/api/user/${userId}/recipe-book/${recipeId}`)
      .pipe(
        switchMap(() => this.getRecipeBook())
      );
  }
}
