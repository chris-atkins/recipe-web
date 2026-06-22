import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Recipe, RecipeService } from '../../../core/services/recipe.service';
import { UserService } from '../../../core/services/user.service';

/**
 * Crowd-sourced tags on the view-recipe page: shows the recipe's tag pills, and —
 * when the viewer is signed in — lets them add a tag (Title-cased + de-duped like
 * the save form) and remove only the tags they added (the ownTags subset). Anonymous
 * viewers see a subtle "Log in to add tags" cue and no controls. After add/remove the
 * recipe's tags + ownTags are refreshed from the returned recipe. Never shows who added a tag.
 */
@Component({
  selector: 'app-recipe-tags',
  templateUrl: './recipe-tags.component.html',
  styleUrls: ['./recipe-tags.component.css']
})
export class RecipeTagsComponent {
  @Input() recipe!: Recipe;
  @Output() recipeChange = new EventEmitter<Recipe>();

  newTag = '';

  constructor(private recipeService: RecipeService, private userService: UserService) {}

  get canEdit(): boolean { return this.userService.isLoggedIn(); }
  get tags(): string[] { return this.recipe?.tags ?? []; }

  /** Whether the current user added this tag (and so may remove it). */
  canRemove(tag: string): boolean {
    return this.canEdit && (this.recipe?.ownTags ?? []).includes(tag);
  }

  addTag(): void {
    const tag = this.titleCase(this.newTag);
    this.newTag = '';
    if (!this.canEdit || !this.recipe?.recipeId || !tag) {
      return;
    }
    if (this.tags.some(t => t.toLowerCase() === tag.toLowerCase())) {
      return;
    }
    this.recipeService.addTag(this.recipe.recipeId, tag)
      .then(updated => this.applyUpdate(updated))
      .catch(() => { /* leave the display unchanged on error */ });
  }

  removeTag(tag: string): void {
    if (!this.canEdit || !this.recipe?.recipeId || !this.canRemove(tag)) {
      return;
    }
    this.recipeService.removeTag(this.recipe.recipeId, tag)
      .then(updated => this.applyUpdate(updated))
      .catch(() => { /* leave the display unchanged on error */ });
  }

  private applyUpdate(updated: Recipe): void {
    this.recipe.tags = updated.tags ?? [];
    this.recipe.ownTags = updated.ownTags ?? [];
    this.recipeChange.emit(this.recipe);
  }

  // Title-case + trim, matching how the save form (TagInputComponent) normalizes tags.
  private titleCase(value: string): string {
    return value.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}
