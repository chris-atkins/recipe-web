import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService, User } from '../../core/services/user.service';
import { RecipeService, Recipe } from '../../core/services/recipe.service';
import { RecipeBookService } from '../../core/services/recipe-book.service';

@Component({
  selector: 'app-recipe-book',
  templateUrl: './recipe-book.component.html',
  styleUrls: ['./recipe-book.component.css']
})
export class RecipeBookComponent implements OnInit {
  user: User | null = null;
  recipeList: Recipe[] = [];

  private userId: string = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private recipeService: RecipeService,
    private recipeBookService: RecipeBookService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
    this.getRecipeBookOwningUser();
    this.getRecipeBook();
  }

  private getRecipeBookOwningUser(): void {
    if (!this.userId) return;

    this.userService.getUserById(this.userId)
      .then((user: User) => {
        this.user = user;
      })
      .catch((error: any) => {
        console.error('Error retrieving user:', error);
      });
  }

  private getRecipeBook(): void {
    if (!this.userId) return;

    this.recipeService.allRecipesInUserBook(this.userId)
      .then((recipeList: Recipe[]) => {
        this.recipeList = recipeList;
      })
      .catch((error: any) => {
        console.error('Error retrieving recipe book:', error);
      });
  }

  removeRecipeFromBook(recipe: Recipe): void {
    this.recipeBookService.removeRecipeFromBook(recipe.recipeId)
      .then(() => {
        this.getRecipeBook();
      })
      .catch((error: any) => {
        console.error('Error removing recipe from book:', error);
      });
  }

  actionsAllowed(): boolean {
    const loggedInUser = this.userService.getLoggedInUser();
    if (!loggedInUser) return false;
    return loggedInUser.userId === this.userId;
  }
}
