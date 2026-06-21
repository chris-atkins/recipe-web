import { Component, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
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
  newRecipeCategory: string | null = null;
  newRecipeTags: string[] = [];
  newImage: RecipeImage | null = null;
  categoryInvalid: boolean = false;
  tagSuggestions: string[] = [];
  private attemptedToSaveWithNoLogin: boolean = false;

  @ViewChild('categorySection') categorySection?: ElementRef<HTMLElement>;

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

    if (!this.newRecipeCategory) {
      this.categoryInvalid = true;
      this.cdr.detectChanges();
      this.categorySection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const recipeToSave: Recipe = {
      recipeName: this.newRecipeName,
      recipeContent: this.newRecipeContent,
      category: this.newRecipeCategory,
      tags: this.newRecipeTags,
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

  onCategoryChange(category: string | null): void {
    this.newRecipeCategory = category;
    this.fetchTagSuggestions(category);
  }

  private fetchTagSuggestions(category: string | null): void {
    if (!category) {
      this.tagSuggestions = [];
      return;
    }
    this.recipeService.getTagSuggestions(category)
      .then(suggestions => {
        this.tagSuggestions = suggestions;
        this.cdr.detectChanges();
      })
      .catch(() => { this.tagSuggestions = []; });
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
