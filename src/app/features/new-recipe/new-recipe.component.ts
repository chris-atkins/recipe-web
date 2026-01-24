import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeService, Recipe, RecipeImage } from '../../core/services/recipe.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-new-recipe',
  templateUrl: './new-recipe.component.html',
  styleUrls: ['./new-recipe.component.css']
})
export class NewRecipeComponent {
  newRecipeName: string = '';
  newRecipeContent: string = '';
  newImage: RecipeImage | null = null;
  private attemptedToSaveWithNoLogin: boolean = false;

  constructor(
    private router: Router,
    private recipeService: RecipeService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  saveRecipeAndNavigate(): void {
    if (!this.userService.isLoggedIn()) {
      this.attemptedToSaveWithNoLogin = true;
      this.cdr.detectChanges();
      return;
    }

    const recipeToSave: Recipe = {
      recipeName: this.newRecipeName,
      recipeContent: this.newRecipeContent,
      image: this.newImage
    };

    this.recipeService.saveRecipe(recipeToSave)
      .then((recipe: Recipe) => {
        this.router.navigate(['/view-recipe', recipe.recipeId]);
      })
      .catch((error: any) => {
        console.error('Error saving recipe:', error);
      });
  }

  shouldShowErrorMessage(): boolean {
    return this.attemptedToSaveWithNoLogin && !this.userService.isLoggedIn();
  }

  imageSaved(image: RecipeImage): void {
    this.newImage = image;
    this.cdr.detectChanges();
  }

  hasImage(): boolean {
    return this.newImage !== null;
  }
}
