import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RecipeService, Recipe, RecipeImage } from '../../core/services/recipe.service';
import { RecipeBookService, RecipeBookItem } from '../../core/services/recipe-book.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-view-recipe',
  templateUrl: './view-recipe.component.html',
  styleUrls: ['./view-recipe.component.css']
})
export class ViewRecipeComponent implements OnInit {
  recipe: Recipe = { recipeName: '', recipeContent: '' };
  recipeContentHtml: SafeHtml = '';
  initialContent: string = '';
  nameBeingEdited: string = '';
  contentBeingEdited: string = '';
  inEditMode: boolean = false;

  private userRecipeBook: RecipeBookItem[] = [];
  private recipeId: string = '';

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private recipeBookService: RecipeBookService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.recipeId = params.get('recipeId') || '';
      if (this.recipeId) {
        this.loadRecipe();
        this.loadRecipeBook();
      }
    });
  }

  private loadRecipe(): void {
    this.recipeService.findRecipe(this.recipeId)
      .then((recipe: Recipe) => {
        this.recipeRetrieved(recipe);
        this.cdr.detectChanges();
      })
      .catch((error: any) => {
        console.error('Error retrieving recipe:', error);
      });
  }

  private recipeRetrieved(recipe: Recipe): void {
    this.recipe = recipe;
    this.initialContent = recipe.recipeContent;
    this.recipeContentHtml = this.sanitizer.bypassSecurityTrustHtml(recipe.recipeContent);
  }

  private loadRecipeBook(): void {
    if (!this.userService.isLoggedIn()) {
      return;
    }
    this.recipeBookService.getRecipeBook()
      .then((recipeBook) => {
        this.userRecipeBook = recipeBook;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.userRecipeBook = [];
      });
  }

  imageSaved(image: RecipeImage): void {
    this.recipe.image = image;
  }

  shouldShowEditButtons(): boolean {
    return this.recipe.editable === true;
  }

  imageExists(): boolean {
    return !!(this.recipe.image && this.recipe.image.imageUrl);
  }

  editClicked(): void {
    this.nameBeingEdited = this.recipe.recipeName;
    this.contentBeingEdited = this.initialContent;
    this.inEditMode = true;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.inEditMode = false;
    this.cdr.detectChanges();
  }

  saveClicked(): void {
    const recipeToPut: Recipe = {
      recipeId: this.recipe.recipeId,
      recipeName: this.nameBeingEdited,
      recipeContent: this.contentBeingEdited,
      image: this.recipe.image
    };

    this.recipeService.saveRecipe(recipeToPut)
      .then((recipe: Recipe) => {
        this.recipeRetrieved(recipe);
        this.inEditMode = false;
      })
      .catch((error: any) => {
        console.error('Error saving recipe:', error);
      });
  }

  inRecipeBook(): boolean {
    if (!this.recipe.recipeId) {
      return false;
    }
    return this.userRecipeBook.some(item => item.recipeId === this.recipe.recipeId);
  }

  canAddToRecipeBook(): boolean {
    return this.userService.isLoggedIn() && !this.inRecipeBook() && !this.inEditMode;
  }

  canRemoveFromRecipeBook(): boolean {
    return !this.inEditMode && this.inRecipeBook();
  }

  addToRecipeBook(): void {
    if (!this.recipe.recipeId) {
      return;
    }
    this.recipeBookService.addToRecipeBook(this.recipe.recipeId)
      .then((recipeBook) => {
        this.userRecipeBook = recipeBook;
      })
      .catch((error: any) => {
        console.error('Error adding to recipe book:', error);
      });
  }

  removeRecipeFromBook(): void {
    if (!this.recipe.recipeId) {
      return;
    }
    this.recipeBookService.removeRecipeFromBook(this.recipe.recipeId)
      .then((recipeBook) => {
        this.userRecipeBook = recipeBook;
      })
      .catch((error: any) => {
        console.error('Error removing from recipe book:', error);
      });
  }

  copyAlternateUrlClicked(): void {
    const url = `${window.location.protocol}//${window.location.host}/recipe/${this.recipe.recipeId}`;
    navigator.clipboard.writeText(url).catch((error) => {
      console.error('Failed to copy URL:', error);
    });
  }
}
