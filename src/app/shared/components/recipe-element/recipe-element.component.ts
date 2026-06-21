import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Recipe, RecipeCardView } from '../../../core/services/recipe.service';
import { RecipeBook, RecipeBookService } from '../../../core/services/recipe-book.service';
import { UserService } from '../../../core/services/user.service';
import { categoryColor, categoryEmoji } from '../../recipe-display';

@Component({
  selector: 'app-recipe-element',
  templateUrl: './recipe-element.component.html',
  styleUrls: ['./recipe-element.component.css']
})
export class RecipeElementComponent implements OnChanges {
  @Input() recipe!: RecipeCardView;
  @Input() recipeBook: RecipeBook | any[] | null = null;
  @Input() recipeBookMode: boolean = false;
  @Input() owningUserId: string = '';
  @Output() recipeRemoved = new EventEmitter<Recipe>();
  @Input() previewMode = false;
  @Output() recipeSelected = new EventEmitter<RecipeCardView>();

  recipeInRecipeBook = false;
  canAddToRecipeBook = false;

  constructor(
    private recipeBookService: RecipeBookService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recipeBook'] || changes['recipe']) {
      this.updateRecipeBookFlags();
    }
  }

  getCategoryColor(): string {
    return categoryColor(this.recipe?.category);
  }

  getCategoryEmoji(): string {
    return categoryEmoji(this.recipe?.category);
  }

  removeAllowed(): boolean {
    const user = this.userService.getLoggedInUser();
    if (!user) {
      return false;
    }
    return user.userId === this.owningUserId;
  }

  removeRecipe(event: Event): void {
    event.stopImmediatePropagation();
    this.recipeRemoved.emit(this.recipe);
  }

  imageExists(): boolean {
    return this.recipe?.image !== null && this.recipe?.image !== undefined;
  }

  getImageUrl(): string {
    if (this.recipe?.image?.imageUrl) {
      return this.recipe.image.imageUrl;
    }
    return '';
  }

  private updateRecipeBookFlags(): void {
    if (this.recipeBookMode) {
      return;
    }

    const inRecipeBook = this.isRecipeInBook();
    if (inRecipeBook) {
      this.recipeInRecipeBook = true;
      this.canAddToRecipeBook = false;
    } else {
      this.recipeInRecipeBook = false;
      this.canAddToRecipeBook = true;
    }
  }

  private isRecipeInBook(): boolean {
    if (!this.recipe || !this.recipeBook) {
      return false;
    }
    return this.recipeBook.some(r => r.recipeId === this.recipe.recipeId);
  }

  addToRecipeBook(event: Event): void {
    event.stopImmediatePropagation();

    if (!this.recipe?.recipeId) {
      return;
    }

    this.recipeBookService.addToRecipeBook(this.recipe.recipeId)
      .then((recipeBook) => {
        this.recipeBook = recipeBook;
        this.updateRecipeBookFlags();
      })
      .catch((error) => {
        console.error('Error adding recipe to book:', error);
      });
  }

  onCardClick(): void {
    if (this.previewMode) {
      this.recipeSelected.emit(this.recipe);
    } else {
      this.navigateToRecipePage();
    }
  }

  navigateToRecipePage(): void {
    if (this.recipe?.recipeId) {
      this.router.navigate(['/view-recipe', this.recipe.recipeId]);
    }
  }
}
