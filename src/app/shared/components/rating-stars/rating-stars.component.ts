import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RecipeRating, RecipeService } from '../../../core/services/recipe.service';
import { UserService } from '../../../core/services/user.service';

/**
 * Star rating widget: shows the community average at rest (smooth fractional fill
 * via a clipped gold star row), and — when interactive + the viewer is signed in —
 * lets them hover to preview and click to rate (PUT, then re-render from the
 * returned aggregate). Read-only on browse cards.
 */
@Component({
  selector: 'app-rating-stars',
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.css']
})
export class RatingStarsComponent {
  @Input() rating: RecipeRating | null | undefined;
  @Input() recipeId?: string;
  @Input() interactive = false;
  @Output() ratingChange = new EventEmitter<RecipeRating>();

  readonly slots = [1, 2, 3, 4, 5];
  hoverValue = 0;
  justRated = 0; // what the viewer submitted this session (0 = none)

  constructor(private recipeService: RecipeService, private userService: UserService) {}

  get average(): number { return this.rating?.average ?? 0; }
  get count(): number { return this.rating?.count ?? 0; }
  get hasRatings(): boolean { return this.count > 0; }
  get loggedIn(): boolean { return this.userService.isLoggedIn(); }
  get canRate(): boolean { return this.interactive && this.loggedIn && !!this.recipeId; }

  /** Gold-fill width %: the hovered preview if hovering, else the community average. */
  get fillPercent(): number {
    const value = this.hoverValue > 0 ? this.hoverValue : this.average;
    return Math.max(0, Math.min(100, (value / 5) * 100));
  }

  onHover(value: number): void {
    if (this.canRate) { this.hoverValue = value; }
  }

  onLeave(): void {
    this.hoverValue = 0;
  }

  rate(value: number): void {
    if (!this.canRate || !this.recipeId) { return; }
    this.recipeService.rateRecipe(this.recipeId, value).then(updated => {
      if (updated.rating) {
        this.rating = updated.rating;
        this.ratingChange.emit(updated.rating);
      }
      this.justRated = value;
      this.hoverValue = 0;
    }).catch(() => { /* leave the display unchanged on error */ });
  }
}
