import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CATEGORY_NAMES, categoryColor, categoryEmoji } from '../../recipe-display';

/**
 * Single-select category picker for the save form: 8 colour-coded preset chips
 * (with dimming) plus an in-place "+ Add your own" custom entry. Category is
 * required by the form, so `invalid` drives a visible required-state error.
 */
@Component({
  selector: 'app-category-picker',
  templateUrl: './category-picker.component.html',
  styleUrls: ['./category-picker.component.css']
})
export class CategoryPickerComponent {
  @Input() category: string | null = null;
  @Output() categoryChange = new EventEmitter<string | null>();

  @Input() invalid = false;
  @Output() invalidChange = new EventEmitter<boolean>();

  @ViewChild('customInput') customInput?: ElementRef<HTMLInputElement>;

  readonly presets = CATEGORY_NAMES;
  adding = false;

  colorFor(category: string): string {
    return categoryColor(category);
  }

  emojiFor(category: string): string {
    return categoryEmoji(category);
  }

  isCustomSelected(): boolean {
    return !!this.category && !this.presets.includes(this.category);
  }

  selectPreset(category: string): void {
    this.setCategory(this.category === category ? null : category);
  }

  startAdd(): void {
    this.adding = true;
    setTimeout(() => this.customInput?.nativeElement.focus());
  }

  onCustomKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitAdd();
    } else if (event.key === 'Escape') {
      this.cancelAdd();
    }
  }

  commitAdd(): void {
    if (!this.adding) {
      return;
    }
    const value = (this.customInput?.nativeElement.value ?? '').trim();
    this.adding = false;
    if (value) {
      this.setCategory(this.titleCase(value));
    }
  }

  cancelAdd(): void {
    this.adding = false;
  }

  private setCategory(value: string | null): void {
    this.category = value;
    this.categoryChange.emit(value);
    if (value && this.invalid) {
      this.invalid = false;
      this.invalidChange.emit(false);
    }
  }

  private titleCase(value: string): string {
    return value.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}
