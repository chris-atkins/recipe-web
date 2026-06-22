import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RecipeService, Recipe, RecipeImage } from '../../core/services/recipe.service';
import { RecipeBookService, RecipeBookItem } from '../../core/services/recipe-book.service';
import { UserService } from '../../core/services/user.service';
import { categoryColor, categoryEmoji } from '../../shared/recipe-display';

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
  categoryBeingEdited: string | null = null;
  tagsBeingEdited: string[] = [];
  tagSuggestions: string[] = [];
  inEditMode: boolean = false;
  categoryInvalid: boolean = false;

  @ViewChild('categorySection') categorySection?: ElementRef<HTMLElement>;

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
    // Replace &nbsp; with regular spaces for proper word wrapping
    let processedContent = recipe.recipeContent.replace(/&nbsp;/g, ' ');
    // Convert newlines to <br> tags for proper line breaks in HTML
    processedContent = processedContent.replace(/\n/g, '<br>');
    this.recipeContentHtml = this.sanitizer.bypassSecurityTrustHtml(processedContent);
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

  getCategoryColor(): string {
    return categoryColor(this.recipe.category);
  }

  getCategoryEmoji(): string {
    return categoryEmoji(this.recipe.category);
  }

  editClicked(): void {
    this.nameBeingEdited = this.recipe.recipeName;
    this.contentBeingEdited = this.initialContent;
    this.categoryBeingEdited = this.recipe.category ?? null;
    this.tagsBeingEdited = [...(this.recipe.tags ?? [])];
    this.categoryInvalid = false;
    this.inEditMode = true;
    this.fetchTagSuggestions(this.categoryBeingEdited);
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.inEditMode = false;
    this.cdr.detectChanges();
  }

  onCategoryChange(category: string | null): void {
    this.categoryBeingEdited = category;
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

  saveClicked(): void {
    if (!this.categoryBeingEdited) {
      this.categoryInvalid = true;
      this.cdr.detectChanges();
      this.categorySection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const recipeToPut: Recipe = {
      recipeId: this.recipe.recipeId,
      recipeName: this.nameBeingEdited,
      recipeContent: this.contentBeingEdited,
      category: this.categoryBeingEdited,
      tags: this.tagsBeingEdited,
      image: this.recipe.image
    };

    this.recipeService.saveRecipe(recipeToPut)
      .then((recipe: Recipe) => {
        this.recipeRetrieved(recipe);
        this.inEditMode = false;
        this.cdr.detectChanges();
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
