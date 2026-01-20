import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, NgZone } from '@angular/core';
import { Recipe } from '../../../core/services/recipe.service';
import { RecipeBook } from '../../../core/services/recipe-book.service';

@Component({
  selector: 'app-recipe-card-wall',
  templateUrl: './recipe-card-wall.component.html',
  styleUrls: ['./recipe-card-wall.component.css']
})
export class RecipeCardWallComponent implements OnInit, OnChanges {
  @Input() recipeList: Recipe[] = [];
  @Input() recipeBook: RecipeBook | null = null;
  @Input() recipeBookMode: boolean = false;
  @Input() owningUserId: string = '';
  @Output() recipeRemoved = new EventEmitter<Recipe>();

  // Internal copy of recipeList that we know is an array
  _recipeListArray: Recipe[] = [];

  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    this.updateRecipeListArray();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recipeList']) {
      this.updateRecipeListArray();
    }
  }

  private updateRecipeListArray(): void {
    // Ensure we run in Angular zone and trigger change detection
    this.zone.run(() => {
      if (Array.isArray(this.recipeList)) {
        this._recipeListArray = [...this.recipeList];
      } else if (this.recipeList && typeof this.recipeList === 'object' && 'length' in this.recipeList) {
        this._recipeListArray = Array.from(this.recipeList as any);
      } else {
        this._recipeListArray = [];
      }
      this.cdr.detectChanges();
    });
  }

  onRecipeRemoved(recipe: Recipe): void {
    this.recipeRemoved.emit(recipe);
  }

  trackByRecipeId(index: number, recipe: Recipe): string {
    return recipe.recipeId || index.toString();
  }
}
