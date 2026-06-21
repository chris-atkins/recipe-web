import { Component, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RecipeCardView, RecipeRating } from '../../../core/services/recipe.service';
import { RecipeBookService } from '../../../core/services/recipe-book.service';
import { categoryColor } from '../../recipe-display';

@Component({
  selector: 'app-recipe-preview',
  templateUrl: './recipe-preview.component.html',
  styleUrls: ['./recipe-preview.component.css']
})
export class RecipePreviewComponent implements OnChanges {
  @Input() recipe: RecipeCardView | null = null;
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  recipeContentHtml: SafeHtml = '';

  constructor(
    private recipeBookService: RecipeBookService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recipe']) {
      this.recipeContentHtml = this.buildRecipeContentHtml();
    }
  }

  // Render the freeform recipe text the same way the full view-recipe page does,
  // so the preview shows the REAL recipe (not placeholder data) and matches what
  // the user sees when they open it.
  private buildRecipeContentHtml(): SafeHtml {
    const raw = this.recipe?.recipeContent ?? '';
    const processed = raw.replace(/&nbsp;/g, ' ').replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(processed);
  }

  getCategoryColor(): string {
    return categoryColor(this.recipe?.category);
  }

  onRatingChange(rating: RecipeRating): void {
    if (this.recipe) {
      this.recipe.rating = rating;
    }
  }

  close(): void {
    this.closed.emit();
  }

  // Close only when the backdrop itself is clicked, not its children.
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.close();
    }
  }

  viewFullRecipe(): void {
    if (this.recipe?.recipeId) {
      this.router.navigate(['/view-recipe', this.recipe.recipeId]);
    }
    this.close();
  }

  addToRecipeBook(): void {
    if (!this.recipe?.recipeId) {
      return;
    }
    this.recipeBookService.addToRecipeBook(this.recipe.recipeId)
      .catch((error) => {
        console.error('Error adding recipe to book:', error);
      });
  }
}
