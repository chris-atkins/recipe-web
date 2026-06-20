import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { RecipeCardView } from '../../../core/services/recipe.service';
import { categoryColor } from '../../recipe-display';

@Component({
  selector: 'app-category-tag-filter',
  templateUrl: './category-tag-filter.component.html',
  styleUrls: ['./category-tag-filter.component.css']
})
export class CategoryTagFilterComponent implements OnChanges {
  @Input() recipes: RecipeCardView[] = [];
  @Output() filteredChange = new EventEmitter<RecipeCardView[]>();

  categories: string[] = [];
  subTags: string[] = [];
  selectedCategory: string | null = null;
  selectedTags = new Set<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recipes']) {
      this.categories = this.distinctSorted(this.recipes.map(r => r.category));
      this.clearSelection();
      this.emitFiltered();
    }
  }

  selectCategory(category: string): void {
    if (this.selectedCategory === category) {
      this.clearSelection();
    } else {
      this.selectedCategory = category;
      this.selectedTags.clear();
      this.subTags = this.distinctSorted(
        this.recipes.filter(r => r.category === category).flatMap(r => r.tags)
      );
    }
    this.emitFiltered();
  }

  toggleTag(tag: string): void {
    if (this.selectedTags.has(tag)) {
      this.selectedTags.delete(tag);
    } else {
      this.selectedTags.add(tag);
    }
    this.emitFiltered();
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategory === category;
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.has(tag);
  }

  getCategoryColor(category: string): string {
    return categoryColor(category);
  }

  private clearSelection(): void {
    this.selectedCategory = null;
    this.selectedTags.clear();
    this.subTags = [];
  }

  private emitFiltered(): void {
    const selectedTags = Array.from(this.selectedTags);
    const filtered = this.recipes.filter(recipe =>
      (!this.selectedCategory || recipe.category === this.selectedCategory) &&
      selectedTags.every(tag => recipe.tags.includes(tag))
    );
    this.filteredChange.emit(filtered);
  }

  private distinctSorted(values: string[]): string[] {
    return Array.from(new Set(values)).sort();
  }
}
